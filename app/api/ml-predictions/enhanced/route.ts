/**
 * Enhanced ML Predictions API
 * Serves predictions from Supabase cache with fallback to real-time generation
 */

import { NextResponse } from "next/server"
import { getPrediction, getBatchPredictions, CachedPrediction } from "@/lib/ml/prediction-service"

// Top tickers to analyze
const DEFAULT_TICKERS = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "JPM", "V",
  "UNH", "JNJ", "MA", "PG", "HD", "MRK", "ABBV", "PEP", "KO", "AVGO",
  "LLY", "MCD", "CSCO", "CRM", "TXN", "ACN", "ABT", "NKE", "ADBE"
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get("ticker")
  const direction = searchParams.get("direction")
  const limit = parseInt(searchParams.get("limit") || "30")
  const sortBy = searchParams.get("sort") || "confidence"
  const timeframe = (searchParams.get("timeframe") || "1w") as "1d" | "1w" | "1m"
  
  // Validate timeframe
  const validTimeframes = ["1d", "1w", "1m"]
  const tf = validTimeframes.includes(timeframe) ? timeframe as "1d" | "1w" | "1m" : "1w"
  
  try {
    let predictions: CachedPrediction[] = []
    
    if (ticker) {
      // Single ticker request
      const upperTicker = ticker.toUpperCase()
      const prediction = await getPrediction(upperTicker, tf)
      predictions = [prediction]
    } else {
      // Batch request for all default tickers
      const predictionMap = await getBatchPredictions(DEFAULT_TICKERS, tf)
      predictions = Array.from(predictionMap.values())
    }
    
    // Filter by direction
    if (direction && direction !== "ALL") {
      predictions = predictions.filter(p => p.direction === direction.toUpperCase())
    }
    
    // Sort predictions
    predictions.sort((a, b) => {
      switch (sortBy) {
        case "confidence": return b.confidence - a.confidence
        case "sharpe": return (b.sharpeRatio || 0) - (a.sharpeRatio || 0)
        case "change": return Math.abs(b.forecastChange) - Math.abs(a.forecastChange)
        case "risk":
          const riskOrder = { low: 0, medium: 1, high: 2 }
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
        default: return b.confidence - a.confidence
      }
    })
    
    // Limit results
    predictions = predictions.slice(0, limit)
    
    // Transform to API response format
    const results = predictions.map(p => ({
      ticker: p.ticker,
      last_price: p.lastPrice,
      forecast_price: p.forecastPrice,
      forecast_change: p.forecastChange,
      price_range_low: p.priceRangeLow,
      price_range_high: p.priceRangeHigh,
      uncertainty_pct: p.uncertaintyPct,
      direction: p.direction,
      confidence: p.confidence,
      risk_level: p.riskLevel,
      reasoning: p.reasoning,
      key_factors: p.keyFactors,
      timeframe: p.timeframe,
      timeframe_label: p.timeframe === "1d" ? "1 Day" : p.timeframe === "1w" ? "1 Week" : "1 Month",
      // Model weights
      w_sarimax: p.wSarimax,
      w_prophet: p.wProphet,
      w_xgboost: p.wXgboost,
      // Individual predictions
      pred_sarimax: p.predSarimax,
      pred_prophet: p.predProphet,
      pred_xgboost: p.predXgboost,
      // Technical indicators
      rsi: p.rsi,
      macd: p.macd,
      macd_signal: p.macdSignal,
      sma_20: p.sma20,
      sma_50: p.sma50,
      ema_12: p.ema12,
      ema_26: p.ema26,
      bollinger_upper: p.bollingerUpper,
      bollinger_lower: p.bollingerLower,
      atr: p.atr,
      volatility: p.volatility,
      momentum: p.momentum,
      volume_ratio: p.volumeRatio,
      position_52w: p.position52w,
      // Performance metrics
      sharpe: p.sharpeRatio,
      alpha: p.alpha,
      max_drawdown: p.maxDrawdown,
      // Sentiment
      sentiment: p.sentimentScore,
      news_sentiment: p.newsSentiment,
      // Metadata
      computed_at: p.computedAt,
      expires_at: p.expiresAt
    }))
    
    // Calculate metadata
    const upCount = predictions.filter(p => p.direction === "UP").length
    const downCount = predictions.filter(p => p.direction === "DOWN").length
    const sidewaysCount = predictions.filter(p => p.direction === "SIDEWAYS").length
    const avgConfidence = predictions.length > 0 
      ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length 
      : 0
    const avgSharpe = predictions.length > 0 
      ? predictions.reduce((sum, p) => sum + (p.sharpeRatio || 0), 0) / predictions.length 
      : 0
    const highRiskCount = predictions.filter(p => p.riskLevel === "high").length
    
    return NextResponse.json({
      success: true,
      count: results.length,
      source: "cache",
      data: results,
      metadata: {
        models: ["SARIMAX", "Prophet", "XGBoost"],
        ensemble: "Adaptive weighted ensemble",
        timeframe: tf,
        avg_confidence: Math.round(avgConfidence),
        avg_sharpe: Math.round(avgSharpe * 100) / 100,
        stocks_up: upCount,
        stocks_down: downCount,
        stocks_sideways: sidewaysCount,
        high_risk_count: highRiskCount,
        generated_at: new Date().toISOString(),
        data_source: "Yahoo Finance + Supabase Cache",
        disclaimer: "AI predictions are probabilistic estimates. Not financial advice."
      }
    })
    
  } catch (error) {
    console.error("[v0] Enhanced predictions API error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch predictions. Please try again.",
      data: []
    }, { status: 500 })
  }
}
