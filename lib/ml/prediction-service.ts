/**
 * Prediction Service
 * Handles fetching, caching, and serving ML predictions via Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { 
  generateEnsemblePrediction, 
  EnsemblePrediction,
  calculateSharpeRatio,
  calculateMaxDrawdown
} from './ensemble-model'
import { PriceData } from './feature-engineering'

// Create a Supabase client for server-side operations (without cookies)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

export interface CachedPrediction {
  id: string
  ticker: string
  timeframe: string
  lastPrice: number
  forecastPrice: number
  forecastChange: number
  priceRangeLow: number
  priceRangeHigh: number
  uncertaintyPct: number
  direction: string
  confidence: number
  riskLevel: string
  wSarimax: number
  wProphet: number
  wXgboost: number
  predSarimax: number | null
  predProphet: number | null
  predXgboost: number | null
  rsi: number | null
  macd: number | null
  macdSignal: number | null
  sma20: number | null
  sma50: number | null
  ema12: number | null
  ema26: number | null
  bollingerUpper: number | null
  bollingerLower: number | null
  atr: number | null
  volatility: number | null
  momentum: number | null
  volumeRatio: number | null
  position52w: number | null
  sharpeRatio: number | null
  alpha: number | null
  maxDrawdown: number | null
  sentimentScore: number | null
  newsSentiment: number | null
  reasoning: string | null
  keyFactors: string[] | null
  computedAt: string
  expiresAt: string
}

/**
 * Cache expiration times by timeframe
 */
const CACHE_TTL: Record<string, number> = {
  '1d': 4 * 60 * 60 * 1000,  // 4 hours for daily predictions
  '1w': 8 * 60 * 60 * 1000,  // 8 hours for weekly
  '1m': 24 * 60 * 60 * 1000  // 24 hours for monthly
}

/**
 * Fetch historical price data from Yahoo Finance
 */
export async function fetchHistoricalData(
  ticker: string, 
  days: number = 365
): Promise<PriceData[]> {
  const endDate = Math.floor(Date.now() / 1000)
  const startDate = endDate - (days * 24 * 60 * 60)
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${startDate}&period2=${endDate}&interval=1d`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    next: { revalidate: 300 }
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch historical data for ${ticker}: ${response.status}`)
  }
  
  const data = await response.json()
  const result = data.chart?.result?.[0]
  
  if (!result) {
    throw new Error(`No historical data available for ${ticker}`)
  }
  
  const timestamps = result.timestamp || []
  const quote = result.indicators?.quote?.[0] || {}
  
  const priceData: PriceData[] = []
  
  for (let i = 0; i < timestamps.length; i++) {
    if (
      quote.open?.[i] != null &&
      quote.high?.[i] != null &&
      quote.low?.[i] != null &&
      quote.close?.[i] != null &&
      quote.volume?.[i] != null
    ) {
      priceData.push({
        date: new Date(timestamps[i] * 1000),
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i]
      })
    }
  }
  
  return priceData
}

/**
 * Check if cached prediction exists and is valid
 */
export async function getCachedPrediction(
  ticker: string,
  timeframe: string
): Promise<CachedPrediction | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('stock_predictions')
    .select('*')
    .eq('ticker', ticker)
    .eq('timeframe', timeframe)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (error || !data) {
    return null
  }
  
  // Map database columns to camelCase
  return {
    id: data.id,
    ticker: data.ticker,
    timeframe: data.timeframe,
    lastPrice: parseFloat(data.last_price),
    forecastPrice: parseFloat(data.forecast_price),
    forecastChange: parseFloat(data.forecast_change),
    priceRangeLow: parseFloat(data.price_range_low),
    priceRangeHigh: parseFloat(data.price_range_high),
    uncertaintyPct: parseFloat(data.uncertainty_pct),
    direction: data.direction,
    confidence: data.confidence,
    riskLevel: data.risk_level,
    wSarimax: parseFloat(data.w_sarimax),
    wProphet: parseFloat(data.w_prophet),
    wXgboost: parseFloat(data.w_xgboost),
    predSarimax: data.pred_sarimax ? parseFloat(data.pred_sarimax) : null,
    predProphet: data.pred_prophet ? parseFloat(data.pred_prophet) : null,
    predXgboost: data.pred_xgboost ? parseFloat(data.pred_xgboost) : null,
    rsi: data.rsi ? parseFloat(data.rsi) : null,
    macd: data.macd ? parseFloat(data.macd) : null,
    macdSignal: data.macd_signal ? parseFloat(data.macd_signal) : null,
    sma20: data.sma_20 ? parseFloat(data.sma_20) : null,
    sma50: data.sma_50 ? parseFloat(data.sma_50) : null,
    ema12: data.ema_12 ? parseFloat(data.ema_12) : null,
    ema26: data.ema_26 ? parseFloat(data.ema_26) : null,
    bollingerUpper: data.bollinger_upper ? parseFloat(data.bollinger_upper) : null,
    bollingerLower: data.bollinger_lower ? parseFloat(data.bollinger_lower) : null,
    atr: data.atr ? parseFloat(data.atr) : null,
    volatility: data.volatility ? parseFloat(data.volatility) : null,
    momentum: data.momentum ? parseFloat(data.momentum) : null,
    volumeRatio: data.volume_ratio ? parseFloat(data.volume_ratio) : null,
    position52w: data.position_52w ? parseFloat(data.position_52w) : null,
    sharpeRatio: data.sharpe_ratio ? parseFloat(data.sharpe_ratio) : null,
    alpha: data.alpha ? parseFloat(data.alpha) : null,
    maxDrawdown: data.max_drawdown ? parseFloat(data.max_drawdown) : null,
    sentimentScore: data.sentiment_score ? parseFloat(data.sentiment_score) : null,
    newsSentiment: data.news_sentiment ? parseFloat(data.news_sentiment) : null,
    reasoning: data.reasoning,
    keyFactors: data.key_factors,
    computedAt: data.computed_at,
    expiresAt: data.expires_at
  }
}

/**
 * Save prediction to cache
 */
export async function cachePrediction(
  ticker: string,
  timeframe: string,
  prediction: EnsemblePrediction,
  lastPrice: number,
  sentimentScore?: number
): Promise<void> {
  const supabase = getSupabaseClient()
  
  const ttl = CACHE_TTL[timeframe] || CACHE_TTL['1d']
  const expiresAt = new Date(Date.now() + ttl).toISOString()
  
  // Calculate additional metrics
  const dailyReturn = prediction.forecastChange / 100 / (timeframe === '1d' ? 1 : timeframe === '1w' ? 5 : 21)
  const sharpeRatio = calculateSharpeRatio(dailyReturn, prediction.features.volatility || 20)
  
  const record = {
    ticker,
    timeframe,
    last_price: lastPrice,
    forecast_price: prediction.forecastPrice,
    forecast_change: prediction.forecastChange,
    price_range_low: prediction.priceRangeLow,
    price_range_high: prediction.priceRangeHigh,
    uncertainty_pct: prediction.uncertaintyPct,
    direction: prediction.direction,
    confidence: prediction.confidence,
    risk_level: prediction.riskLevel,
    w_sarimax: prediction.weights.sarimax,
    w_prophet: prediction.weights.prophet,
    w_xgboost: prediction.weights.xgboost,
    pred_sarimax: prediction.sarimax.price,
    pred_prophet: prediction.prophet.price,
    pred_xgboost: prediction.xgboost.price,
    rsi: prediction.features.rsi,
    macd: prediction.features.macd,
    macd_signal: prediction.features.macdSignal,
    sma_20: prediction.features.sma20,
    sma_50: prediction.features.sma50,
    ema_12: prediction.features.ema12,
    ema_26: prediction.features.ema26,
    bollinger_upper: prediction.features.bollingerUpper,
    bollinger_lower: prediction.features.bollingerLower,
    atr: prediction.features.atr,
    volatility: prediction.features.volatility,
    momentum: prediction.features.momentum,
    volume_ratio: prediction.features.volumeRatio,
    position_52w: prediction.features.position52w,
    sharpe_ratio: sharpeRatio,
    alpha: null, // Would require benchmark data
    max_drawdown: null, // Calculated separately if needed
    sentiment_score: sentimentScore ?? null,
    news_sentiment: sentimentScore ?? null,
    reasoning: prediction.reasoning,
    key_factors: prediction.keyFactors,
    computed_at: new Date().toISOString(),
    expires_at: expiresAt
  }
  
  // Upsert the prediction
  const { error } = await supabase
    .from('stock_predictions')
    .upsert(record, { 
      onConflict: 'ticker,timeframe',
      ignoreDuplicates: false 
    })
  
  if (error) {
    console.error(`[v0] Failed to cache prediction for ${ticker}:`, error)
  }
}

/**
 * Generate fresh prediction for a ticker
 */
export async function generatePrediction(
  ticker: string,
  timeframe: '1d' | '1w' | '1m'
): Promise<EnsemblePrediction> {
  // Fetch historical data
  const historicalData = await fetchHistoricalData(ticker, 365)
  
  if (historicalData.length < 50) {
    throw new Error(`Insufficient historical data for ${ticker}: only ${historicalData.length} days`)
  }
  
  // Generate prediction
  const prediction = generateEnsemblePrediction(historicalData, timeframe)
  
  return prediction
}

/**
 * Get prediction for a ticker (from cache or generate fresh)
 */
export async function getPrediction(
  ticker: string,
  timeframe: '1d' | '1w' | '1m',
  forceRefresh: boolean = false
): Promise<CachedPrediction> {
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = await getCachedPrediction(ticker, timeframe)
    if (cached) {
      return cached
    }
  }
  
  // Generate fresh prediction
  const historicalData = await fetchHistoricalData(ticker, 365)
  const lastPrice = historicalData[historicalData.length - 1]?.close || 0
  
  const prediction = generateEnsemblePrediction(historicalData, timeframe)
  
  // Cache the prediction
  await cachePrediction(ticker, timeframe, prediction, lastPrice)
  
  // Return in cached format
  return {
    id: '',
    ticker,
    timeframe,
    lastPrice,
    forecastPrice: prediction.forecastPrice,
    forecastChange: prediction.forecastChange,
    priceRangeLow: prediction.priceRangeLow,
    priceRangeHigh: prediction.priceRangeHigh,
    uncertaintyPct: prediction.uncertaintyPct,
    direction: prediction.direction,
    confidence: prediction.confidence,
    riskLevel: prediction.riskLevel,
    wSarimax: prediction.weights.sarimax,
    wProphet: prediction.weights.prophet,
    wXgboost: prediction.weights.xgboost,
    predSarimax: prediction.sarimax.price,
    predProphet: prediction.prophet.price,
    predXgboost: prediction.xgboost.price,
    rsi: prediction.features.rsi,
    macd: prediction.features.macd,
    macdSignal: prediction.features.macdSignal,
    sma20: prediction.features.sma20,
    sma50: prediction.features.sma50,
    ema12: prediction.features.ema12,
    ema26: prediction.features.ema26,
    bollingerUpper: prediction.features.bollingerUpper,
    bollingerLower: prediction.features.bollingerLower,
    atr: prediction.features.atr,
    volatility: prediction.features.volatility,
    momentum: prediction.features.momentum,
    volumeRatio: prediction.features.volumeRatio,
    position52w: prediction.features.position52w,
    sharpeRatio: calculateSharpeRatio(
      prediction.forecastChange / 100 / (timeframe === '1d' ? 1 : timeframe === '1w' ? 5 : 21),
      prediction.features.volatility || 20
    ),
    alpha: null,
    maxDrawdown: null,
    sentimentScore: null,
    newsSentiment: null,
    reasoning: prediction.reasoning,
    keyFactors: prediction.keyFactors,
    computedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + CACHE_TTL[timeframe]).toISOString()
  }
}

/**
 * Batch get predictions for multiple tickers
 */
export async function getBatchPredictions(
  tickers: string[],
  timeframe: '1d' | '1w' | '1m'
): Promise<Map<string, CachedPrediction>> {
  const supabase = getSupabaseClient()
  const results = new Map<string, CachedPrediction>()
  
  // First, try to get all from cache
  const { data: cachedData } = await supabase
    .from('stock_predictions')
    .select('*')
    .in('ticker', tickers)
    .eq('timeframe', timeframe)
    .gt('expires_at', new Date().toISOString())
  
  const cachedTickers = new Set<string>()
  
  if (cachedData) {
    for (const row of cachedData) {
      cachedTickers.add(row.ticker)
      results.set(row.ticker, {
        id: row.id,
        ticker: row.ticker,
        timeframe: row.timeframe,
        lastPrice: parseFloat(row.last_price),
        forecastPrice: parseFloat(row.forecast_price),
        forecastChange: parseFloat(row.forecast_change),
        priceRangeLow: parseFloat(row.price_range_low),
        priceRangeHigh: parseFloat(row.price_range_high),
        uncertaintyPct: parseFloat(row.uncertainty_pct),
        direction: row.direction,
        confidence: row.confidence,
        riskLevel: row.risk_level,
        wSarimax: parseFloat(row.w_sarimax),
        wProphet: parseFloat(row.w_prophet),
        wXgboost: parseFloat(row.w_xgboost),
        predSarimax: row.pred_sarimax ? parseFloat(row.pred_sarimax) : null,
        predProphet: row.pred_prophet ? parseFloat(row.pred_prophet) : null,
        predXgboost: row.pred_xgboost ? parseFloat(row.pred_xgboost) : null,
        rsi: row.rsi ? parseFloat(row.rsi) : null,
        macd: row.macd ? parseFloat(row.macd) : null,
        macdSignal: row.macd_signal ? parseFloat(row.macd_signal) : null,
        sma20: row.sma_20 ? parseFloat(row.sma_20) : null,
        sma50: row.sma_50 ? parseFloat(row.sma_50) : null,
        ema12: row.ema_12 ? parseFloat(row.ema_12) : null,
        ema26: row.ema_26 ? parseFloat(row.ema_26) : null,
        bollingerUpper: row.bollinger_upper ? parseFloat(row.bollinger_upper) : null,
        bollingerLower: row.bollinger_lower ? parseFloat(row.bollinger_lower) : null,
        atr: row.atr ? parseFloat(row.atr) : null,
        volatility: row.volatility ? parseFloat(row.volatility) : null,
        momentum: row.momentum ? parseFloat(row.momentum) : null,
        volumeRatio: row.volume_ratio ? parseFloat(row.volume_ratio) : null,
        position52w: row.position_52w ? parseFloat(row.position_52w) : null,
        sharpeRatio: row.sharpe_ratio ? parseFloat(row.sharpe_ratio) : null,
        alpha: row.alpha ? parseFloat(row.alpha) : null,
        maxDrawdown: row.max_drawdown ? parseFloat(row.max_drawdown) : null,
        sentimentScore: row.sentiment_score ? parseFloat(row.sentiment_score) : null,
        newsSentiment: row.news_sentiment ? parseFloat(row.news_sentiment) : null,
        reasoning: row.reasoning,
        keyFactors: row.key_factors,
        computedAt: row.computed_at,
        expiresAt: row.expires_at
      })
    }
  }
  
  // Generate predictions for missing tickers (with concurrency limit)
  const missingTickers = tickers.filter(t => !cachedTickers.has(t))
  
  if (missingTickers.length > 0) {
    const concurrencyLimit = 3 // Limit concurrent API calls
    
    for (let i = 0; i < missingTickers.length; i += concurrencyLimit) {
      const batch = missingTickers.slice(i, i + concurrencyLimit)
      
      const promises = batch.map(async (ticker) => {
        try {
          const prediction = await getPrediction(ticker, timeframe)
          results.set(ticker, prediction)
        } catch (error) {
          console.error(`[v0] Failed to generate prediction for ${ticker}:`, error)
        }
      })
      
      await Promise.all(promises)
      
      // Small delay between batches to avoid rate limiting
      if (i + concurrencyLimit < missingTickers.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }
  
  return results
}

/**
 * Get all cached predictions for dashboard stats
 */
export async function getAllCachedPredictions(
  timeframe: string
): Promise<CachedPrediction[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('stock_predictions')
    .select('*')
    .eq('timeframe', timeframe)
    .gt('expires_at', new Date().toISOString())
    .order('confidence', { ascending: false })
  
  if (error || !data) {
    return []
  }
  
  return data.map(row => ({
    id: row.id,
    ticker: row.ticker,
    timeframe: row.timeframe,
    lastPrice: parseFloat(row.last_price),
    forecastPrice: parseFloat(row.forecast_price),
    forecastChange: parseFloat(row.forecast_change),
    priceRangeLow: parseFloat(row.price_range_low),
    priceRangeHigh: parseFloat(row.price_range_high),
    uncertaintyPct: parseFloat(row.uncertainty_pct),
    direction: row.direction,
    confidence: row.confidence,
    riskLevel: row.risk_level,
    wSarimax: parseFloat(row.w_sarimax),
    wProphet: parseFloat(row.w_prophet),
    wXgboost: parseFloat(row.w_xgboost),
    predSarimax: row.pred_sarimax ? parseFloat(row.pred_sarimax) : null,
    predProphet: row.pred_prophet ? parseFloat(row.pred_prophet) : null,
    predXgboost: row.pred_xgboost ? parseFloat(row.pred_xgboost) : null,
    rsi: row.rsi ? parseFloat(row.rsi) : null,
    macd: row.macd ? parseFloat(row.macd) : null,
    macdSignal: row.macd_signal ? parseFloat(row.macd_signal) : null,
    sma20: row.sma_20 ? parseFloat(row.sma_20) : null,
    sma50: row.sma_50 ? parseFloat(row.sma_50) : null,
    ema12: row.ema_12 ? parseFloat(row.ema_12) : null,
    ema26: row.ema_26 ? parseFloat(row.ema_26) : null,
    bollingerUpper: row.bollinger_upper ? parseFloat(row.bollinger_upper) : null,
    bollingerLower: row.bollinger_lower ? parseFloat(row.bollinger_lower) : null,
    atr: row.atr ? parseFloat(row.atr) : null,
    volatility: row.volatility ? parseFloat(row.volatility) : null,
    momentum: row.momentum ? parseFloat(row.momentum) : null,
    volumeRatio: row.volume_ratio ? parseFloat(row.volume_ratio) : null,
    position52w: row.position_52w ? parseFloat(row.position_52w) : null,
    sharpeRatio: row.sharpe_ratio ? parseFloat(row.sharpe_ratio) : null,
    alpha: row.alpha ? parseFloat(row.alpha) : null,
    maxDrawdown: row.max_drawdown ? parseFloat(row.max_drawdown) : null,
    sentimentScore: row.sentiment_score ? parseFloat(row.sentiment_score) : null,
    newsSentiment: row.news_sentiment ? parseFloat(row.news_sentiment) : null,
    reasoning: row.reasoning,
    keyFactors: row.key_factors,
    computedAt: row.computed_at,
    expiresAt: row.expires_at
  }))
}
