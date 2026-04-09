/**
 * Cron Job: Pre-compute ML Predictions
 * Runs every 4 hours to update predictions for tracked stocks
 * Configure in vercel.json: {"crons": [{"path": "/api/cron/compute-predictions", "schedule": "0 */4 * * *"}]}
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  fetchHistoricalData, 
  cachePrediction 
} from '@/lib/ml/prediction-service'
import { generateEnsemblePrediction } from '@/lib/ml/ensemble-model'
import { getTickerSentiment } from '@/lib/ml/news-sentiment'
import { DEFAULT_PREDICTION_TICKERS, COMPANY_NAMES } from '@/lib/stocks'

// Use the comprehensive stock list from lib/stocks.ts
const DEFAULT_TICKERS = DEFAULT_PREDICTION_TICKERS

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

export async function GET(request: Request) {
  // Verify cron secret (if configured)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const startTime = Date.now()
  const results: { ticker: string; status: string; error?: string }[] = []
  const timeframes: ('1d' | '1w' | '1m')[] = ['1d', '1w', '1m']
  
  console.log('[v0] Starting prediction computation cron job')
  
  for (const ticker of DEFAULT_TICKERS) {
    try {
      console.log(`[v0] Processing ${ticker}...`)
      
      // Fetch historical data once for all timeframes
      const historicalData = await fetchHistoricalData(ticker, 365)
      
      if (historicalData.length < 50) {
        results.push({
          ticker,
          status: 'skipped',
          error: `Insufficient data: ${historicalData.length} days`
        })
        continue
      }
      
      const lastPrice = historicalData[historicalData.length - 1].close
      
      // Get news sentiment (optional, don't fail if unavailable)
      let sentimentScore: number | undefined
      try {
        const sentiment = await getTickerSentiment(ticker, COMPANY_NAMES[ticker])
        sentimentScore = sentiment.overallSentiment
      } catch (sentimentError) {
        console.warn(`[v0] Sentiment fetch failed for ${ticker}:`, sentimentError)
      }
      
      // Generate predictions for all timeframes
      for (const timeframe of timeframes) {
        try {
          const prediction = generateEnsemblePrediction(historicalData, timeframe)
          await cachePrediction(ticker, timeframe, prediction, lastPrice, sentimentScore)
        } catch (tfError) {
          console.error(`[v0] Failed ${ticker}/${timeframe}:`, tfError)
        }
      }
      
      results.push({ ticker, status: 'success' })
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))
      
    } catch (error) {
      console.error(`[v0] Failed to process ${ticker}:`, error)
      results.push({
        ticker,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  // Update prediction stats
  try {
    await updatePredictionStats(timeframes)
  } catch (statsError) {
    console.error('[v0] Failed to update stats:', statsError)
  }
  
  const duration = Date.now() - startTime
  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  
  console.log(`[v0] Cron job completed in ${duration}ms: ${successCount} success, ${errorCount} errors`)
  
  return NextResponse.json({
    success: true,
    duration: `${duration}ms`,
    processed: results.length,
    successful: successCount,
    errors: errorCount,
    results
  })
}

/**
 * Update aggregated prediction statistics
 */
async function updatePredictionStats(timeframes: string[]): Promise<void> {
  const supabase = getSupabaseClient()
  const today = new Date().toISOString().split('T')[0]
  
  for (const timeframe of timeframes) {
    const { data: predictions } = await supabase
      .from('stock_predictions')
      .select('direction, confidence, risk_level, sharpe_ratio')
      .eq('timeframe', timeframe)
      .gt('expires_at', new Date().toISOString())
    
    if (!predictions || predictions.length === 0) continue
    
    const stats = {
      stat_date: today,
      timeframe,
      total_predictions: predictions.length,
      bullish_count: predictions.filter(p => p.direction === 'UP').length,
      bearish_count: predictions.filter(p => p.direction === 'DOWN').length,
      neutral_count: predictions.filter(p => p.direction === 'SIDEWAYS').length,
      avg_confidence: predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length,
      avg_sharpe: predictions.filter(p => p.sharpe_ratio != null)
        .reduce((s, p) => s + (p.sharpe_ratio || 0), 0) / 
        Math.max(1, predictions.filter(p => p.sharpe_ratio != null).length),
      high_risk_count: predictions.filter(p => p.risk_level === 'high').length,
      computed_at: new Date().toISOString()
    }
    
    await supabase
      .from('prediction_stats')
      .upsert(stats, { onConflict: 'stat_date,timeframe' })
  }
}

// Also support POST for manual triggering
export async function POST(request: Request) {
  return GET(request)
}
