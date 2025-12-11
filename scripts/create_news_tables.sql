-- Create news articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  source_logo TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  tickers TEXT[] DEFAULT '{}',
  category TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  is_pinned BOOLEAN DEFAULT false,
  is_trusted BOOLEAN DEFAULT true,
  content_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create news sources table
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  feed_url TEXT,
  api_endpoint TEXT,
  is_active BOOLEAN DEFAULT true,
  is_trusted BOOLEAN DEFAULT true,
  parse_method TEXT CHECK (parse_method IN ('rss', 'api', 'scrape')),
  last_fetched_at TIMESTAMPTZ,
  fetch_interval_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tracked tickers table
CREATE TABLE IF NOT EXISTS tracked_tickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create price history table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  volume BIGINT,
  change_percent NUMERIC(6, 2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_tickers ON news_articles USING GIN(tickers);
CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
CREATE INDEX IF NOT EXISTS idx_news_pinned ON news_articles(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_price_ticker_timestamp ON price_history(ticker, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_tickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_articles
-- Anyone can read news
CREATE POLICY "Anyone can read news" ON news_articles FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert news" ON news_articles FOR INSERT 
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update news" ON news_articles FOR UPDATE 
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete news" ON news_articles FOR DELETE 
  TO authenticated USING (true);

-- RLS Policies for news_sources
CREATE POLICY "Anyone can read sources" ON news_sources FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage sources" ON news_sources FOR ALL 
  TO authenticated USING (true);

-- RLS Policies for tracked_tickers
CREATE POLICY "Anyone can read tickers" ON tracked_tickers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage tickers" ON tracked_tickers FOR ALL 
  TO authenticated USING (true);

-- RLS Policies for price_history
CREATE POLICY "Anyone can read prices" ON price_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert prices" ON price_history FOR INSERT 
  TO authenticated WITH CHECK (true);

-- Insert default news sources
INSERT INTO news_sources (name, url, feed_url, parse_method, is_trusted) VALUES
  ('Bloomberg', 'https://www.bloomberg.com', 'https://www.bloomberg.com/feed/podcast/etf-report.xml', 'rss', true),
  ('Reuters', 'https://www.reuters.com', 'https://www.reuters.com/finance/markets/rss', 'rss', true),
  ('CNBC', 'https://www.cnbc.com', 'https://www.cnbc.com/id/100003114/device/rss/rss.html', 'rss', true),
  ('Yahoo Finance', 'https://finance.yahoo.com', null, 'api', true),
  ('Investing.com', 'https://www.investing.com', 'https://www.investing.com/rss/news.rss', 'rss', true),
  ('MarketWatch', 'https://www.marketwatch.com', 'https://www.marketwatch.com/rss/', 'rss', true),
  ('Finviz', 'https://finviz.com', null, 'scrape', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default tracked tickers
INSERT INTO tracked_tickers (ticker, company_name) VALUES
  ('AAPL', 'Apple Inc.'),
  ('MSFT', 'Microsoft Corporation'),
  ('GOOGL', 'Alphabet Inc.'),
  ('AMZN', 'Amazon.com Inc.'),
  ('TSLA', 'Tesla Inc.'),
  ('META', 'Meta Platforms Inc.'),
  ('NVDA', 'NVIDIA Corporation'),
  ('BRK.B', 'Berkshire Hathaway Inc.'),
  ('JPM', 'JPMorgan Chase & Co.'),
  ('V', 'Visa Inc.')
ON CONFLICT (ticker) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for news_articles
DROP TRIGGER IF EXISTS update_news_articles_updated_at ON news_articles;
CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
