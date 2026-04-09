// ML Prediction Types for FINPREDICT

export interface TechnicalIndicators {
  rsi: number
  macd: number
  macdSignal: number
  macdHistogram: number
  sma20: number
  sma50: number
  ema12: number
  ema26: number
  bollingerUpper: number
  bollingerMiddle: number
  bollingerLower: number
  atr: number
  volatility: number
  momentum: number
  volumeRatio: number
  position52w: number
  priceVsSma20: number
  priceVsSma50: number
}

export interface ModelPrediction {
  model: 'sarimax' | 'prophet' | 'xgboost'
  prediction: number
  confidence: number
  weight: number
}

export interface ModelWeights {
  sarimax: number
  prophet: number
  xgboost: number
}

export interface EnsemblePrediction {
  ticker: string
  timeframe: '1d' | '1w' | '1m'
  timeframeLabel: string
  
  // Price data
  lastPrice: number
  forecastPrice: number
  forecastChange: number
  priceRangeLow: number
  priceRangeHigh: number
  uncertaintyPct: number
  
  // Direction and confidence
  direction: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  
  // Model contributions
  weights: ModelWeights
  modelPredictions: {
    sarimax: number | null
    prophet: number | null
    xgboost: number | null
  }
  
  // Technical indicators
  indicators: TechnicalIndicators
  
  // Risk metrics
  riskMetrics: {
    sharpeRatio: number
    alpha: number
    maxDrawdown: number
  }
  
  // Sentiment
  sentimentScore: number
  newsSentiment: number
  
  // Explanation
  reasoning: string
  keyFactors: string[]
  
  // Metadata
  computedAt: string
  expiresAt: string
  dataSource: string
}

export interface NewsArticle {
  id: string
  ticker: string
  title: string
  description: string | null
  source: string | null
  url: string
  publishedAt: string
  sentimentScore: number
  sentimentLabel: 'positive' | 'negative' | 'neutral'
  relevanceScore: number
}

export interface NewsSentimentSummary {
  ticker: string
  overallSentiment: number
  sentimentLabel: 'bullish' | 'bearish' | 'neutral'
  articleCount: number
  positiveCount: number
  negativeCount: number
  neutralCount: number
  recentArticles: NewsArticle[]
  lastUpdated: string
}

export interface MarketFactors {
  factorDate: string
  sp500Value: number
  vixValue: number
  treasury10y: number
  treasury2y: number
  yieldSpread: number
  dxyIndex: number
  oilWti: number
  goldPrice: number
  advancingStocks: number
  decliningStocks: number
  newHighs: number
  newLows: number
  putCallRatio: number
  fearGreedIndex: number
}

export interface PredictionStats {
  statDate: string
  timeframe: string
  totalPredictions: number
  bullishCount: number
  bearishCount: number
  neutralCount: number
  avgConfidence: number
  avgSharpe: number
  highRiskCount: number
}

// API Response types
export interface PredictionApiResponse {
  success: boolean
  predictions: EnsemblePrediction[]
  metadata: {
    computedAt: string
    expiresAt: string
    source: 'cache' | 'fresh'
    disclaimer: string
  }
}

export interface NewsSentimentApiResponse {
  success: boolean
  data: NewsSentimentSummary
  error?: string
}

// Database row types (matching Supabase schema)
export interface StockPredictionRow {
  id: string
  ticker: string
  timeframe: string
  last_price: number
  forecast_price: number
  forecast_change: number
  price_range_low: number
  price_range_high: number
  uncertainty_pct: number
  direction: string
  confidence: number
  risk_level: string
  w_sarimax: number
  w_prophet: number
  w_xgboost: number
  pred_sarimax: number | null
  pred_prophet: number | null
  pred_xgboost: number | null
  rsi: number | null
  macd: number | null
  macd_signal: number | null
  sma_20: number | null
  sma_50: number | null
  ema_12: number | null
  ema_26: number | null
  bollinger_upper: number | null
  bollinger_lower: number | null
  atr: number | null
  volatility: number | null
  momentum: number | null
  volume_ratio: number | null
  position_52w: number | null
  sharpe_ratio: number | null
  alpha: number | null
  max_drawdown: number | null
  sentiment_score: number | null
  news_sentiment: number | null
  reasoning: string | null
  key_factors: string[] | null
  computed_at: string
  expires_at: string
  data_source: string
}

export interface NewsSentimentRow {
  id: string
  ticker: string
  title: string
  description: string | null
  source: string | null
  url: string
  published_at: string | null
  sentiment_score: number | null
  sentiment_label: string | null
  relevance_score: number | null
  fetched_at: string
}
