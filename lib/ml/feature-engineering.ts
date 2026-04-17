/**
 * Feature Engineering Module
 * Calculates technical indicators for stock prediction models
 */

export interface PriceData {
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TechnicalIndicators {
  // Trend indicators
  sma20: number | null
  sma50: number | null
  ema12: number | null
  ema26: number | null
  
  // Momentum indicators
  rsi: number | null
  macd: number | null
  macdSignal: number | null
  macdHistogram: number | null
  momentum: number | null
  roc: number | null // Rate of Change
  
  // Volatility indicators
  bollingerUpper: number | null
  bollingerLower: number | null
  bollingerMiddle: number | null
  atr: number | null
  volatility: number | null
  
  // Volume indicators
  volumeRatio: number | null
  obv: number | null // On-Balance Volume
  
  // Position metrics
  position52w: number | null // Position within 52-week range
  distanceFromSMA: number | null
}

export interface FeatureSet extends TechnicalIndicators {
  // Price features
  priceChange1d: number
  priceChange5d: number
  priceChange20d: number
  
  // Derived features
  trendStrength: number
  volatilityRegime: 'low' | 'medium' | 'high'
  momentumScore: number
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null
  const slice = prices.slice(-period)
  return slice.reduce((sum, p) => sum + p, 0) / period
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null
  
  const multiplier = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
  }
  
  return ema
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null
  
  const changes: number[] = []
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1])
  }
  
  const gains = changes.map(c => c > 0 ? c : 0)
  const losses = changes.map(c => c < 0 ? Math.abs(c) : 0)
  
  // Initial averages
  let avgGain = gains.slice(0, period).reduce((s, g) => s + g, 0) / period
  let avgLoss = losses.slice(0, period).reduce((s, l) => s + l, 0) / period
  
  // Smoothed averages
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
  }
  
  if (avgLoss === 0) return 100
  
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[]): {
  macd: number | null
  signal: number | null
  histogram: number | null
} {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  
  if (ema12 === null || ema26 === null) {
    return { macd: null, signal: null, histogram: null }
  }
  
  const macd = ema12 - ema26
  
  // Calculate MACD line for signal
  const macdLine: number[] = []
  const mult12 = 2 / 13
  const mult26 = 2 / 27
  
  let runningEma12 = prices.slice(0, 12).reduce((s, p) => s + p, 0) / 12
  let runningEma26 = prices.slice(0, 26).reduce((s, p) => s + p, 0) / 26
  
  for (let i = 26; i < prices.length; i++) {
    runningEma12 = (prices[i] - runningEma12) * mult12 + runningEma12
    runningEma26 = (prices[i] - runningEma26) * mult26 + runningEma26
    macdLine.push(runningEma12 - runningEma26)
  }
  
  // Signal is 9-period EMA of MACD
  const signal = macdLine.length >= 9 ? calculateEMA(macdLine, 9) : null
  const histogram = signal !== null ? macd - signal : null
  
  return { macd, signal, histogram }
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(prices: number[], period: number = 20, stdDevMultiplier: number = 2): {
  upper: number | null
  middle: number | null
  lower: number | null
} {
  const sma = calculateSMA(prices, period)
  if (sma === null) return { upper: null, middle: null, lower: null }
  
  const slice = prices.slice(-period)
  const variance = slice.reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / period
  const stdDev = Math.sqrt(variance)
  
  return {
    upper: sma + stdDevMultiplier * stdDev,
    middle: sma,
    lower: sma - stdDevMultiplier * stdDev
  }
}

/**
 * Calculate Average True Range (ATR)
 */
export function calculateATR(data: PriceData[], period: number = 14): number | null {
  if (data.length < period + 1) return null
  
  const trueRanges: number[] = []
  
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high
    const low = data[i].low
    const prevClose = data[i - 1].close
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    )
    trueRanges.push(tr)
  }
  
  // Simple average for first ATR
  let atr = trueRanges.slice(0, period).reduce((s, tr) => s + tr, 0) / period
  
  // Smoothed ATR
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period
  }
  
  return atr
}

/**
 * Calculate historical volatility (annualized standard deviation of returns)
 */
export function calculateVolatility(prices: number[], period: number = 20): number | null {
  if (prices.length < period + 1) return null
  
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]))
  }
  
  const recentReturns = returns.slice(-period)
  const mean = recentReturns.reduce((s, r) => s + r, 0) / period
  const variance = recentReturns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / period
  
  // Annualize (252 trading days)
  return Math.sqrt(variance * 252) * 100
}

/**
 * Calculate momentum (rate of change)
 */
export function calculateMomentum(prices: number[], period: number = 10): number | null {
  if (prices.length < period + 1) return null
  
  const currentPrice = prices[prices.length - 1]
  const pastPrice = prices[prices.length - 1 - period]
  
  return ((currentPrice - pastPrice) / pastPrice) * 100
}

/**
 * Calculate Volume Ratio (current volume vs average)
 */
export function calculateVolumeRatio(volumes: number[], period: number = 20): number | null {
  if (volumes.length < period) return null
  
  const avgVolume = volumes.slice(-period, -1).reduce((s, v) => s + v, 0) / (period - 1)
  const currentVolume = volumes[volumes.length - 1]
  
  return avgVolume > 0 ? currentVolume / avgVolume : null
}

/**
 * Calculate On-Balance Volume (OBV)
 */
export function calculateOBV(data: PriceData[]): number | null {
  if (data.length < 2) return null
  
  let obv = 0
  
  for (let i = 1; i < data.length; i++) {
    if (data[i].close > data[i - 1].close) {
      obv += data[i].volume
    } else if (data[i].close < data[i - 1].close) {
      obv -= data[i].volume
    }
    // If equal, OBV stays the same
  }
  
  return obv
}

/**
 * Calculate position within 52-week range (0 = at low, 100 = at high)
 */
export function calculatePosition52Week(prices: number[]): number | null {
  // Need ~252 trading days for 52 weeks
  const period = Math.min(prices.length, 252)
  if (period < 20) return null
  
  const slice = prices.slice(-period)
  const high = Math.max(...slice)
  const low = Math.min(...slice)
  const current = prices[prices.length - 1]
  
  if (high === low) return 50
  return ((current - low) / (high - low)) * 100
}

/**
 * Calculate all technical indicators from price data
 */
export function calculateAllIndicators(data: PriceData[]): TechnicalIndicators {
  const closes = data.map(d => d.close)
  const volumes = data.map(d => d.volume)
  
  const sma20 = calculateSMA(closes, 20)
  const sma50 = calculateSMA(closes, 50)
  const ema12 = calculateEMA(closes, 12)
  const ema26 = calculateEMA(closes, 26)
  
  const rsi = calculateRSI(closes, 14)
  const { macd, signal: macdSignal, histogram: macdHistogram } = calculateMACD(closes)
  const momentum = calculateMomentum(closes, 10)
  const roc = calculateMomentum(closes, 12) // 12-day rate of change
  
  const { upper: bollingerUpper, middle: bollingerMiddle, lower: bollingerLower } = calculateBollingerBands(closes)
  const atr = calculateATR(data, 14)
  const volatility = calculateVolatility(closes, 20)
  
  const volumeRatio = calculateVolumeRatio(volumes, 20)
  const obv = calculateOBV(data)
  
  const position52w = calculatePosition52Week(closes)
  const distanceFromSMA = sma20 !== null ? ((closes[closes.length - 1] - sma20) / sma20) * 100 : null
  
  return {
    sma20,
    sma50,
    ema12,
    ema26,
    rsi,
    macd,
    macdSignal,
    macdHistogram,
    momentum,
    roc,
    bollingerUpper,
    bollingerMiddle,
    bollingerLower,
    atr,
    volatility,
    volumeRatio,
    obv,
    position52w,
    distanceFromSMA
  }
}

/**
 * Calculate complete feature set for ML models
 */
export function calculateFeatureSet(data: PriceData[]): FeatureSet {
  const indicators = calculateAllIndicators(data)
  const closes = data.map(d => d.close)
  const currentPrice = closes[closes.length - 1]
  
  // Price changes
  const priceChange1d = closes.length >= 2 
    ? ((currentPrice - closes[closes.length - 2]) / closes[closes.length - 2]) * 100 
    : 0
  
  const priceChange5d = closes.length >= 6 
    ? ((currentPrice - closes[closes.length - 6]) / closes[closes.length - 6]) * 100 
    : 0
  
  const priceChange20d = closes.length >= 21 
    ? ((currentPrice - closes[closes.length - 21]) / closes[closes.length - 21]) * 100 
    : 0
  
  // Trend strength: combination of moving average alignment and momentum
  let trendStrength = 0
  if (indicators.sma20 !== null && indicators.sma50 !== null) {
    const maAlignment = indicators.sma20 > indicators.sma50 ? 1 : -1
    const priceAboveSMA = currentPrice > indicators.sma20 ? 1 : -1
    const momentumDir = (indicators.momentum ?? 0) > 0 ? 1 : -1
    trendStrength = (maAlignment + priceAboveSMA + momentumDir) / 3
  }
  
  // Volatility regime classification
  const vol = indicators.volatility ?? 20
  const volatilityRegime: 'low' | 'medium' | 'high' = 
    vol < 15 ? 'low' : vol < 30 ? 'medium' : 'high'
  
  // Momentum score: normalized combination of RSI, MACD histogram, and momentum
  let momentumScore = 0
  const rsiNorm = indicators.rsi !== null ? (indicators.rsi - 50) / 50 : 0
  const macdNorm = indicators.macdHistogram !== null 
    ? Math.max(-1, Math.min(1, indicators.macdHistogram / (Math.abs(currentPrice) * 0.01)))
    : 0
  const momNorm = indicators.momentum !== null 
    ? Math.max(-1, Math.min(1, indicators.momentum / 10))
    : 0
  
  momentumScore = (rsiNorm * 0.3 + macdNorm * 0.4 + momNorm * 0.3)
  
  return {
    ...indicators,
    priceChange1d,
    priceChange5d,
    priceChange20d,
    trendStrength,
    volatilityRegime,
    momentumScore
  }
}

/**
 * Normalize features for ML model input
 */
export function normalizeFeatures(features: FeatureSet): Record<string, number> {
  return {
    // Trend indicators (normalized to -1 to 1 range where applicable)
    sma20_dist: features.distanceFromSMA !== null ? Math.max(-1, Math.min(1, features.distanceFromSMA / 10)) : 0,
    ema_cross: features.ema12 !== null && features.ema26 !== null 
      ? (features.ema12 > features.ema26 ? 1 : -1) 
      : 0,
    
    // Momentum (0-100 range for RSI, normalized others)
    rsi: features.rsi !== null ? features.rsi / 100 : 0.5,
    rsi_overbought: (features.rsi ?? 50) > 70 ? 1 : 0,
    rsi_oversold: (features.rsi ?? 50) < 30 ? 1 : 0,
    macd_signal: features.macdHistogram !== null 
      ? Math.max(-1, Math.min(1, features.macdHistogram * 10)) 
      : 0,
    momentum_norm: Math.max(-1, Math.min(1, features.momentumScore)),
    
    // Volatility
    volatility_norm: (features.volatility ?? 20) / 50,
    volatility_low: features.volatilityRegime === 'low' ? 1 : 0,
    volatility_high: features.volatilityRegime === 'high' ? 1 : 0,
    atr_norm: features.atr !== null && features.sma20 !== null
      ? features.atr / features.sma20 * 100
      : 0,
    
    // Bollinger position
    bb_position: features.bollingerUpper !== null && features.bollingerLower !== null && features.bollingerMiddle !== null
      ? (features.sma20! - features.bollingerLower) / (features.bollingerUpper - features.bollingerLower)
      : 0.5,
    
    // Volume
    volume_ratio: Math.min(3, features.volumeRatio ?? 1),
    
    // Position
    position_52w: (features.position52w ?? 50) / 100,
    
    // Price changes
    change_1d: Math.max(-1, Math.min(1, features.priceChange1d / 5)),
    change_5d: Math.max(-1, Math.min(1, features.priceChange5d / 10)),
    change_20d: Math.max(-1, Math.min(1, features.priceChange20d / 20)),
    
    // Trend
    trend_strength: features.trendStrength
  }
}
