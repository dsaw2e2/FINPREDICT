/**
 * Ensemble Forecasting Engine
 * Combines SARIMAX-style, Prophet-style, and XGBoost-style models
 * All models run in TypeScript without Python dependencies
 */

import { 
  PriceData, 
  FeatureSet, 
  calculateFeatureSet, 
  normalizeFeatures,
  calculateSMA,
  calculateEMA,
  calculateVolatility
} from './feature-engineering'

export interface ModelPrediction {
  price: number
  confidence: number
  direction: 'UP' | 'DOWN' | 'SIDEWAYS'
}

export interface EnsemblePrediction {
  // Final ensemble prediction
  forecastPrice: number
  forecastChange: number
  direction: 'UP' | 'DOWN' | 'SIDEWAYS'
  confidence: number
  
  // Price range
  priceRangeLow: number
  priceRangeHigh: number
  uncertaintyPct: number
  
  // Individual model predictions
  sarimax: ModelPrediction
  prophet: ModelPrediction
  xgboost: ModelPrediction
  
  // Model weights
  weights: {
    sarimax: number
    prophet: number
    xgboost: number
  }
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high'
  
  // Feature data
  features: FeatureSet
  
  // Reasoning
  reasoning: string
  keyFactors: string[]
}

/**
 * SARIMAX-Style Model
 * Uses autoregressive patterns with seasonal components
 * Simplified implementation for serverless environment
 */
function predictSARIMAX(data: PriceData[], horizon: number): ModelPrediction {
  const closes = data.map(d => d.close)
  const currentPrice = closes[closes.length - 1]
  
  // Calculate trend component using linear regression on recent data
  const trendPeriod = Math.min(60, closes.length)
  const recentPrices = closes.slice(-trendPeriod)
  
  // Simple linear regression
  const n = recentPrices.length
  const xMean = (n - 1) / 2
  const yMean = recentPrices.reduce((s, p) => s + p, 0) / n
  
  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (recentPrices[i] - yMean)
    denominator += (i - xMean) ** 2
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0
  const dailyTrend = slope / currentPrice
  
  // Seasonal component (weekly pattern)
  const weeklyReturns: number[] = []
  for (let i = 5; i < closes.length; i++) {
    weeklyReturns.push((closes[i] - closes[i - 5]) / closes[i - 5])
  }
  const avgWeeklyReturn = weeklyReturns.length > 0 
    ? weeklyReturns.slice(-12).reduce((s, r) => s + r, 0) / Math.min(12, weeklyReturns.length)
    : 0
  
  // Mean reversion component
  const sma50 = calculateSMA(closes, 50)
  const meanReversionPull = sma50 !== null 
    ? (sma50 - currentPrice) / currentPrice * 0.1 
    : 0
  
  // Autoregressive component (recent momentum)
  const ar1 = closes.length >= 2 ? (closes[closes.length - 1] / closes[closes.length - 2] - 1) : 0
  const ar5 = closes.length >= 6 ? (closes[closes.length - 1] / closes[closes.length - 6] - 1) / 5 : 0
  
  // Combine components based on horizon
  let projectedReturn: number
  if (horizon === 1) {
    // 1 day: emphasize AR and trend
    projectedReturn = dailyTrend * 0.4 + ar1 * 0.3 + ar5 * 0.2 + meanReversionPull * 0.1
  } else if (horizon <= 5) {
    // 1 week: balanced
    projectedReturn = (dailyTrend * horizon * 0.3 + avgWeeklyReturn * 0.3 + meanReversionPull * 0.4) / horizon * horizon
  } else {
    // 1 month: emphasize mean reversion and trend
    projectedReturn = dailyTrend * horizon * 0.3 + avgWeeklyReturn * (horizon / 5) * 0.2 + meanReversionPull * 3 * 0.5
  }
  
  const forecastPrice = currentPrice * (1 + projectedReturn)
  
  // Confidence based on trend consistency
  const volatility = calculateVolatility(closes, 20) ?? 20
  const trendConsistency = Math.abs(ar1 - ar5 * 5) < 0.02 ? 0.8 : 0.6
  const confidence = Math.max(30, Math.min(85, 70 - volatility + trendConsistency * 20))
  
  const changePercent = projectedReturn * 100
  const direction: 'UP' | 'DOWN' | 'SIDEWAYS' = 
    changePercent > 1 ? 'UP' : changePercent < -1 ? 'DOWN' : 'SIDEWAYS'
  
  return {
    price: forecastPrice,
    confidence,
    direction
  }
}

/**
 * Prophet-Style Model
 * Decomposes time series into trend, seasonality, and holidays
 * Adapted for stock market patterns
 */
function predictProphet(data: PriceData[], horizon: number): ModelPrediction {
  const closes = data.map(d => d.close)
  const currentPrice = closes[closes.length - 1]
  
  // Trend component using piecewise linear trend
  const segments = [
    { period: 20, weight: 0.4 },  // Short-term trend
    { period: 60, weight: 0.35 }, // Medium-term trend
    { period: 120, weight: 0.25 } // Long-term trend
  ]
  
  let trendComponent = 0
  for (const seg of segments) {
    if (closes.length >= seg.period) {
      const startPrice = closes[closes.length - seg.period]
      const trend = (currentPrice - startPrice) / startPrice / seg.period
      trendComponent += trend * seg.weight
    }
  }
  
  // Seasonality: day-of-week effect (approximated)
  // Markets tend to be slightly bullish on Tuesdays/Wednesdays
  const dayOfWeek = new Date().getDay()
  const weekdayEffect = dayOfWeek === 2 || dayOfWeek === 3 ? 0.001 : 
                         dayOfWeek === 1 || dayOfWeek === 5 ? -0.0005 : 0
  
  // Monthly seasonality (turn of month effect)
  const dayOfMonth = new Date().getDate()
  const monthEffect = dayOfMonth <= 3 || dayOfMonth >= 28 ? 0.002 : 0
  
  // Yearly seasonality (sell in May, Santa rally)
  const month = new Date().getMonth()
  const yearEffect = month >= 10 ? 0.002 :  // Nov-Dec bullish
                     month >= 4 && month <= 9 ? -0.001 : // May-Sep weaker
                     0.001 // Jan-Apr decent
  
  // Volatility regime adjustment
  const volatility = calculateVolatility(closes, 20) ?? 20
  const volAdjustment = volatility > 30 ? 0.8 : volatility < 15 ? 1.1 : 1.0
  
  // Combine components
  const dailyReturn = trendComponent + weekdayEffect + monthEffect + yearEffect
  const projectedReturn = dailyReturn * horizon * volAdjustment
  
  const forecastPrice = currentPrice * (1 + projectedReturn)
  
  // Prophet-style uncertainty grows with horizon
  const baseConfidence = 75
  const horizonPenalty = Math.sqrt(horizon) * 3
  const volPenalty = volatility * 0.5
  const confidence = Math.max(35, Math.min(90, baseConfidence - horizonPenalty - volPenalty))
  
  const changePercent = projectedReturn * 100
  const direction: 'UP' | 'DOWN' | 'SIDEWAYS' = 
    changePercent > 0.8 ? 'UP' : changePercent < -0.8 ? 'DOWN' : 'SIDEWAYS'
  
  return {
    price: forecastPrice,
    confidence,
    direction
  }
}

/**
 * XGBoost-Style Model
 * Uses gradient boosting concepts with technical indicators
 * Simplified decision tree ensemble
 */
function predictXGBoost(data: PriceData[], features: FeatureSet, horizon: number): ModelPrediction {
  const closes = data.map(d => d.close)
  const currentPrice = closes[closes.length - 1]
  const normalizedFeatures = normalizeFeatures(features)
  
  // Simulate ensemble of decision stumps
  let bullishScore = 0
  let bearishScore = 0
  const votes: number[] = []
  
  // Tree 1: Trend following
  if (normalizedFeatures.ema_cross > 0 && normalizedFeatures.trend_strength > 0) {
    bullishScore += 0.15
    votes.push(1)
  } else if (normalizedFeatures.ema_cross < 0 && normalizedFeatures.trend_strength < 0) {
    bearishScore += 0.15
    votes.push(-1)
  } else {
    votes.push(0)
  }
  
  // Tree 2: RSI mean reversion
  if (normalizedFeatures.rsi_oversold > 0) {
    bullishScore += 0.12
    votes.push(1)
  } else if (normalizedFeatures.rsi_overbought > 0) {
    bearishScore += 0.12
    votes.push(-1)
  } else {
    votes.push(normalizedFeatures.rsi > 0.5 ? -0.5 : 0.5)
  }
  
  // Tree 3: MACD momentum
  if (normalizedFeatures.macd_signal > 0.2) {
    bullishScore += 0.18
    votes.push(1)
  } else if (normalizedFeatures.macd_signal < -0.2) {
    bearishScore += 0.18
    votes.push(-1)
  } else {
    votes.push(normalizedFeatures.macd_signal)
  }
  
  // Tree 4: Bollinger Band position
  if (normalizedFeatures.bb_position < 0.2) {
    bullishScore += 0.10 // Near lower band
    votes.push(0.8)
  } else if (normalizedFeatures.bb_position > 0.8) {
    bearishScore += 0.10 // Near upper band
    votes.push(-0.8)
  } else {
    votes.push(0)
  }
  
  // Tree 5: Volume confirmation
  if (normalizedFeatures.volume_ratio > 1.5 && normalizedFeatures.change_1d > 0) {
    bullishScore += 0.12
    votes.push(1)
  } else if (normalizedFeatures.volume_ratio > 1.5 && normalizedFeatures.change_1d < 0) {
    bearishScore += 0.12
    votes.push(-1)
  } else {
    votes.push(0)
  }
  
  // Tree 6: 52-week position
  if (normalizedFeatures.position_52w < 0.3) {
    bullishScore += 0.08 // Near 52w low - potential reversal
    votes.push(0.6)
  } else if (normalizedFeatures.position_52w > 0.9) {
    bearishScore += 0.05 // Near 52w high - still momentum
    votes.push(-0.3)
  } else {
    votes.push(0)
  }
  
  // Tree 7: Recent price action
  if (normalizedFeatures.change_5d > 0.3 && normalizedFeatures.change_1d > 0) {
    bullishScore += 0.15
    votes.push(1)
  } else if (normalizedFeatures.change_5d < -0.3 && normalizedFeatures.change_1d < 0) {
    bearishScore += 0.15
    votes.push(-1)
  } else {
    votes.push(normalizedFeatures.change_5d)
  }
  
  // Tree 8: Volatility regime
  if (normalizedFeatures.volatility_low > 0) {
    bullishScore += 0.05 // Low vol tends to drift up
    votes.push(0.3)
  } else if (normalizedFeatures.volatility_high > 0) {
    bearishScore += 0.08 // High vol often precedes drops
    votes.push(-0.5)
  } else {
    votes.push(0)
  }
  
  // Aggregate scores
  const netScore = bullishScore - bearishScore
  const avgVote = votes.reduce((s, v) => s + v, 0) / votes.length
  
  // Convert to expected return
  const baseReturn = netScore * 0.015 + avgVote * 0.005
  const horizonAdjustedReturn = baseReturn * Math.sqrt(horizon)
  
  // Cap the return based on volatility
  const volatility = features.volatility ?? 20
  const maxReturn = volatility * 0.01 * Math.sqrt(horizon)
  const projectedReturn = Math.max(-maxReturn, Math.min(maxReturn, horizonAdjustedReturn))
  
  const forecastPrice = currentPrice * (1 + projectedReturn)
  
  // Confidence based on vote agreement
  const voteVariance = votes.reduce((s, v) => s + Math.pow(v - avgVote, 2), 0) / votes.length
  const agreementScore = 1 - Math.sqrt(voteVariance)
  const confidence = Math.max(40, Math.min(85, 50 + agreementScore * 35 - volatility * 0.3))
  
  const changePercent = projectedReturn * 100
  const direction: 'UP' | 'DOWN' | 'SIDEWAYS' = 
    netScore > 0.15 ? 'UP' : netScore < -0.15 ? 'DOWN' : 'SIDEWAYS'
  
  return {
    price: forecastPrice,
    confidence,
    direction
  }
}

/**
 * Calculate adaptive model weights based on market regime
 */
function calculateModelWeights(features: FeatureSet): {
  sarimax: number
  prophet: number
  xgboost: number
} {
  const volatility = features.volatility ?? 20
  const trendStrength = Math.abs(features.trendStrength)
  
  // Base weights
  let wSarimax = 0.33
  let wProphet = 0.33
  let wXgboost = 0.34
  
  // High volatility: favor XGBoost (better at capturing non-linear patterns)
  if (volatility > 30) {
    wXgboost += 0.1
    wSarimax -= 0.05
    wProphet -= 0.05
  }
  
  // Strong trend: favor SARIMAX (better at trend projection)
  if (trendStrength > 0.5) {
    wSarimax += 0.08
    wProphet -= 0.04
    wXgboost -= 0.04
  }
  
  // Low volatility: favor Prophet (seasonality matters more)
  if (volatility < 15) {
    wProphet += 0.08
    wSarimax -= 0.04
    wXgboost -= 0.04
  }
  
  // RSI extreme: favor XGBoost (mean reversion signals)
  const rsi = features.rsi ?? 50
  if (rsi < 30 || rsi > 70) {
    wXgboost += 0.06
    wSarimax -= 0.03
    wProphet -= 0.03
  }
  
  // Normalize to sum to 1
  const sum = wSarimax + wProphet + wXgboost
  return {
    sarimax: wSarimax / sum,
    prophet: wProphet / sum,
    xgboost: wXgboost / sum
  }
}

/**
 * Generate reasoning based on analysis
 */
function generateReasoning(
  features: FeatureSet, 
  direction: 'UP' | 'DOWN' | 'SIDEWAYS',
  weights: { sarimax: number; prophet: number; xgboost: number }
): { reasoning: string; keyFactors: string[] } {
  const keyFactors: string[] = []
  const reasoningParts: string[] = []
  
  // Trend analysis
  if (features.trendStrength > 0.3) {
    keyFactors.push('Strong uptrend detected')
    reasoningParts.push('Price is in a confirmed uptrend with moving averages aligned bullishly')
  } else if (features.trendStrength < -0.3) {
    keyFactors.push('Strong downtrend detected')
    reasoningParts.push('Price is in a confirmed downtrend with moving averages aligned bearishly')
  }
  
  // RSI analysis
  const rsi = features.rsi ?? 50
  if (rsi > 70) {
    keyFactors.push('RSI indicates overbought conditions')
    reasoningParts.push(`RSI at ${rsi.toFixed(1)} suggests potential pullback`)
  } else if (rsi < 30) {
    keyFactors.push('RSI indicates oversold conditions')
    reasoningParts.push(`RSI at ${rsi.toFixed(1)} suggests potential bounce`)
  }
  
  // MACD analysis
  if (features.macdHistogram !== null) {
    if (features.macdHistogram > 0 && features.macd !== null && features.macd > 0) {
      keyFactors.push('MACD bullish momentum')
    } else if (features.macdHistogram < 0 && features.macd !== null && features.macd < 0) {
      keyFactors.push('MACD bearish momentum')
    }
  }
  
  // Volatility
  if (features.volatilityRegime === 'high') {
    keyFactors.push('Elevated volatility environment')
    reasoningParts.push('Higher uncertainty due to elevated market volatility')
  } else if (features.volatilityRegime === 'low') {
    keyFactors.push('Low volatility regime')
  }
  
  // Position in range
  const pos52w = features.position52w ?? 50
  if (pos52w > 85) {
    keyFactors.push('Near 52-week highs')
  } else if (pos52w < 15) {
    keyFactors.push('Near 52-week lows')
  }
  
  // Volume
  if (features.volumeRatio !== null && features.volumeRatio > 1.5) {
    keyFactors.push('Above-average trading volume')
  }
  
  // Model weight explanation
  const dominantModel = weights.sarimax >= weights.prophet && weights.sarimax >= weights.xgboost 
    ? 'time-series analysis'
    : weights.prophet >= weights.xgboost 
      ? 'seasonal patterns'
      : 'technical indicators'
  
  reasoningParts.push(`Ensemble favors ${dominantModel} in current market conditions`)
  
  const reasoning = reasoningParts.join('. ') + '.'
  
  return { reasoning, keyFactors: keyFactors.slice(0, 5) }
}

/**
 * Main ensemble prediction function
 */
export function generateEnsemblePrediction(
  data: PriceData[],
  timeframe: '1d' | '1w' | '1m'
): EnsemblePrediction {
  // Determine horizon in trading days
  const horizon = timeframe === '1d' ? 1 : timeframe === '1w' ? 5 : 21
  
  // Calculate features
  const features = calculateFeatureSet(data)
  const currentPrice = data[data.length - 1].close
  
  // Get individual model predictions
  const sarimax = predictSARIMAX(data, horizon)
  const prophet = predictProphet(data, horizon)
  const xgboost = predictXGBoost(data, features, horizon)
  
  // Calculate adaptive weights
  const weights = calculateModelWeights(features)
  
  // Weighted ensemble prediction
  const ensemblePrice = 
    sarimax.price * weights.sarimax +
    prophet.price * weights.prophet +
    xgboost.price * weights.xgboost
  
  const ensembleConfidence = 
    sarimax.confidence * weights.sarimax +
    prophet.confidence * weights.prophet +
    xgboost.confidence * weights.xgboost
  
  // Calculate forecast change
  const forecastChange = ((ensemblePrice - currentPrice) / currentPrice) * 100
  
  // Determine direction based on consensus
  const directions = [sarimax.direction, prophet.direction, xgboost.direction]
  const upVotes = directions.filter(d => d === 'UP').length
  const downVotes = directions.filter(d => d === 'DOWN').length
  
  let direction: 'UP' | 'DOWN' | 'SIDEWAYS'
  if (upVotes >= 2 && forecastChange > 0.5) {
    direction = 'UP'
  } else if (downVotes >= 2 && forecastChange < -0.5) {
    direction = 'DOWN'
  } else if (Math.abs(forecastChange) < 1) {
    direction = 'SIDEWAYS'
  } else {
    direction = forecastChange > 0 ? 'UP' : 'DOWN'
  }
  
  // Calculate price range (uncertainty bounds)
  const volatility = features.volatility ?? 20
  const volatilityMultiplier = horizon === 1 ? 1 : horizon === 5 ? 1.5 : 2.5
  const uncertaintyPct = volatility * volatilityMultiplier * 0.1
  
  const priceRangeLow = ensemblePrice * (1 - uncertaintyPct / 100)
  const priceRangeHigh = ensemblePrice * (1 + uncertaintyPct / 100)
  
  // Risk assessment
  let riskLevel: 'low' | 'medium' | 'high'
  if (volatility < 20 && Math.abs(forecastChange) < 5 && ensembleConfidence > 65) {
    riskLevel = 'low'
  } else if (volatility > 35 || Math.abs(forecastChange) > 10 || ensembleConfidence < 45) {
    riskLevel = 'high'
  } else {
    riskLevel = 'medium'
  }
  
  // Generate reasoning
  const { reasoning, keyFactors } = generateReasoning(features, direction, weights)
  
  return {
    forecastPrice: ensemblePrice,
    forecastChange,
    direction,
    confidence: Math.round(ensembleConfidence),
    priceRangeLow,
    priceRangeHigh,
    uncertaintyPct,
    sarimax,
    prophet,
    xgboost,
    weights,
    riskLevel,
    features,
    reasoning,
    keyFactors
  }
}

/**
 * Calculate Sharpe ratio for the prediction
 */
export function calculateSharpeRatio(
  expectedReturn: number,
  volatility: number,
  riskFreeRate: number = 4.5 // Current approximate rate
): number {
  if (volatility === 0) return 0
  const annualizedReturn = expectedReturn * 252 // Assuming daily return
  return (annualizedReturn - riskFreeRate) / volatility
}

/**
 * Calculate maximum drawdown from historical data
 */
export function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0
  
  let maxDrawdown = 0
  let peak = prices[0]
  
  for (const price of prices) {
    if (price > peak) {
      peak = price
    }
    const drawdown = (peak - price) / peak * 100
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }
  
  return maxDrawdown
}

/**
 * Calculate alpha (excess return over benchmark)
 */
export function calculateAlpha(
  stockReturns: number[],
  benchmarkReturns: number[]
): number {
  if (stockReturns.length !== benchmarkReturns.length || stockReturns.length < 2) {
    return 0
  }
  
  const avgStock = stockReturns.reduce((s, r) => s + r, 0) / stockReturns.length
  const avgBench = benchmarkReturns.reduce((s, r) => s + r, 0) / benchmarkReturns.length
  
  // Simplified alpha calculation
  return (avgStock - avgBench) * 252 // Annualized
}
