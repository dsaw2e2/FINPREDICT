-- Migration: Add AI-powered sentiment analysis columns to news_articles
-- Run this in your Supabase SQL editor after create_news_tables.sql

-- Add sentiment analysis columns
ALTER TABLE news_articles 
  ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(4,3) CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
  ADD COLUMN IF NOT EXISTS impact_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS sentiment_model TEXT DEFAULT 'gemini-2.0-flash';

-- Create index for sentiment queries
CREATE INDEX IF NOT EXISTS idx_news_sentiment_score ON news_articles(sentiment_score) WHERE sentiment_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_published_sentiment ON news_articles(published_at DESC, sentiment_score) WHERE sentiment_score IS NOT NULL;

-- Create daily_sentiment materialized view for ML pipeline consumption
-- Aggregates per-article sentiment into daily averages
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_sentiment AS
SELECT 
  DATE(published_at) AS date,
  AVG(sentiment_score) AS avg_sentiment,
  STDDEV(sentiment_score) AS sentiment_volatility,
  COUNT(*) AS article_count,
  COUNT(*) FILTER (WHERE sentiment_score > 0.2) AS bullish_count,
  COUNT(*) FILTER (WHERE sentiment_score < -0.2) AS bearish_count,
  COUNT(*) FILTER (WHERE sentiment_score BETWEEN -0.2 AND 0.2) AS neutral_count
FROM news_articles
WHERE sentiment_score IS NOT NULL
GROUP BY DATE(published_at)
ORDER BY date DESC;

-- Create unique index to allow REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_sentiment_date ON daily_sentiment(date);

-- RLS for the materialized view is not needed (views inherit table RLS)
-- But we need a function to refresh it
CREATE OR REPLACE FUNCTION refresh_daily_sentiment()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sentiment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
