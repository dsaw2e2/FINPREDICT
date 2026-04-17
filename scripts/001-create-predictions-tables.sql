-- FINPREDICT Database Schema
-- Stock predictions cache, news sentiment, market factors, and stats

-- ============================================
-- Table 1: Stock Predictions Cache
-- ============================================
CREATE TABLE IF NOT EXISTS stock_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  timeframe VARCHAR(5) NOT NULL, -- '1d', '1w', '1m'
  
  -- Price data
  last_price DECIMAL(12,4) NOT NULL,
  forecast_price DECIMAL(12,4) NOT NULL,
  forecast_change DECIMAL(8,4) NOT NULL,
  price_range_low DECIMAL(12,4) NOT NULL,
  price_range_high DECIMAL(12,4) NOT NULL,
  uncertainty_pct DECIMAL(6,2) NOT NULL,
  
  -- Direction & confidence
  direction VARCHAR(10) NOT NULL, -- 'UP', 'DOWN', 'SIDEWAYS'
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  risk_level VARCHAR(10) NOT NULL, -- 'low', 'medium', 'high'
  
  -- Model weights (sum to 1.0)
  w_sarimax DECIMAL(5,4) NOT NULL,
  w_prophet DECIMAL(5,4) NOT NULL,
  w_xgboost DECIMAL(5,4) NOT NULL,
  
  -- Individual model predictions
  pred_sarimax DECIMAL(12,4),
  pred_prophet DECIMAL(12,4),
  pred_xgboost DECIMAL(12,4),
  
  -- Technical indicators
  rsi DECIMAL(6,2),
  macd DECIMAL(10,4),
  macd_signal DECIMAL(10,4),
  sma_20 DECIMAL(12,4),
  sma_50 DECIMAL(12,4),
  ema_12 DECIMAL(12,4),
  ema_26 DECIMAL(12,4),
  bollinger_upper DECIMAL(12,4),
  bollinger_lower DECIMAL(12,4),
  atr DECIMAL(10,4),
  volatility DECIMAL(6,2),
  momentum DECIMAL(8,4),
  volume_ratio DECIMAL(6,2),
  position_52w DECIMAL(6,2),
  
  -- Performance metrics
  sharpe_ratio DECIMAL(6,2),
  alpha DECIMAL(8,4),
  max_drawdown DECIMAL(6,2),
  
  -- Sentiment
  sentiment_score DECIMAL(4,2), -- -1 to 1
  news_sentiment DECIMAL(4,2),
  
  -- Reasoning
  reasoning TEXT,
  key_factors JSONB,
  
  -- Metadata
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  data_source VARCHAR(50) DEFAULT 'yahoo_finance',
  
  UNIQUE(ticker, timeframe)
);

-- Indexes for stock_predictions
CREATE INDEX IF NOT EXISTS idx_predictions_ticker ON stock_predictions(ticker);
CREATE INDEX IF NOT EXISTS idx_predictions_timeframe ON stock_predictions(timeframe);
CREATE INDEX IF NOT EXISTS idx_predictions_direction ON stock_predictions(direction);
CREATE INDEX IF NOT EXISTS idx_predictions_expires ON stock_predictions(expires_at);
CREATE INDEX IF NOT EXISTS idx_predictions_confidence ON stock_predictions(confidence DESC);

-- ============================================
-- Table 2: News Sentiment Cache
-- ============================================
CREATE TABLE IF NOT EXISTS news_sentiment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  
  -- Article data
  title TEXT NOT NULL,
  description TEXT,
  source VARCHAR(100),
  url TEXT,
  published_at TIMESTAMPTZ,
  
  -- Sentiment analysis
  sentiment_score DECIMAL(4,2), -- -1 to 1
  sentiment_label VARCHAR(20), -- 'positive', 'negative', 'neutral'
  relevance_score DECIMAL(4,2), -- 0 to 1
  
  -- Metadata
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(ticker, url)
);

-- Indexes for news_sentiment
CREATE INDEX IF NOT EXISTS idx_news_ticker ON news_sentiment(ticker);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_sentiment(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_sentiment(sentiment_score);

-- ============================================
-- Table 3: Market Factors
-- ============================================
CREATE TABLE IF NOT EXISTS market_factors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factor_date DATE NOT NULL,
  
  -- Macroeconomic indicators
  sp500_value DECIMAL(12,4),
  vix_value DECIMAL(8,4),
  treasury_10y DECIMAL(6,4),
  treasury_2y DECIMAL(6,4),
  yield_spread DECIMAL(6,4),
  dxy_index DECIMAL(8,4),
  oil_wti DECIMAL(8,4),
  gold_price DECIMAL(10,4),
  
  -- Market breadth
  advancing_stocks INTEGER,
  declining_stocks INTEGER,
  new_highs INTEGER,
  new_lows INTEGER,
  
  -- Sentiment indicators
  put_call_ratio DECIMAL(6,4),
  fear_greed_index INTEGER,
  
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(factor_date)
);

-- Indexes for market_factors
CREATE INDEX IF NOT EXISTS idx_factors_date ON market_factors(factor_date DESC);

-- ============================================
-- Table 4: Prediction Statistics
-- ============================================
CREATE TABLE IF NOT EXISTS prediction_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_date DATE NOT NULL,
  timeframe VARCHAR(5) NOT NULL,
  
  total_predictions INTEGER,
  bullish_count INTEGER,
  bearish_count INTEGER,
  neutral_count INTEGER,
  avg_confidence DECIMAL(5,2),
  avg_sharpe DECIMAL(6,2),
  high_risk_count INTEGER,
  
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(stat_date, timeframe)
);

-- Index for prediction_stats
CREATE INDEX IF NOT EXISTS idx_stats_date ON prediction_stats(stat_date DESC);
