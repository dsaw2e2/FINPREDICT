/**
 * News Sentiment Analysis Module
 * Fetches financial news via NewsAPI and analyzes sentiment
 */

import { createClient } from '@supabase/supabase-js'

// Create Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

export interface NewsArticle {
  title: string
  description: string | null
  source: string
  url: string
  publishedAt: string
  sentimentScore: number
  sentimentLabel: 'positive' | 'negative' | 'neutral'
  relevanceScore: number
}

export interface TickerSentiment {
  ticker: string
  articles: NewsArticle[]
  overallSentiment: number
  sentimentLabel: 'bullish' | 'bearish' | 'neutral'
  articleCount: number
  lastUpdated: string
}

// Sentiment lexicon for financial news
const POSITIVE_WORDS = new Set([
  'surge', 'soar', 'jump', 'gain', 'rally', 'rise', 'climb', 'boost', 'growth',
  'profit', 'revenue', 'beat', 'exceed', 'outperform', 'upgrade', 'buy', 'bullish',
  'optimistic', 'positive', 'strong', 'robust', 'recovery', 'breakthrough', 'record',
  'success', 'win', 'deal', 'partnership', 'expansion', 'dividend', 'innovation',
  'launch', 'approve', 'approval', 'momentum', 'upside', 'opportunity', 'confidence'
])

const NEGATIVE_WORDS = new Set([
  'drop', 'fall', 'decline', 'plunge', 'crash', 'sink', 'tumble', 'slide', 'loss',
  'miss', 'fail', 'underperform', 'downgrade', 'sell', 'bearish', 'pessimistic',
  'negative', 'weak', 'concern', 'risk', 'warning', 'cut', 'layoff', 'lawsuit',
  'investigation', 'recall', 'delay', 'trouble', 'crisis', 'debt', 'bankruptcy',
  'default', 'fraud', 'scandal', 'penalty', 'fine', 'downside', 'uncertainty'
])

const INTENSIFIERS = new Set([
  'very', 'extremely', 'significantly', 'sharply', 'dramatically', 'strongly',
  'highly', 'major', 'massive', 'huge', 'substantial'
])

const NEGATORS = new Set([
  'not', 'no', "n't", 'never', 'neither', 'nobody', 'nothing', 'nowhere',
  'hardly', 'barely', 'scarcely', 'despite', 'without'
])

/**
 * Simple lexicon-based sentiment analysis
 * Returns a score from -1 (very negative) to 1 (very positive)
 */
export function analyzeSentiment(text: string): { score: number; label: 'positive' | 'negative' | 'neutral' } {
  if (!text) return { score: 0, label: 'neutral' }
  
  const words = text.toLowerCase().split(/\W+/)
  let score = 0
  let wordCount = 0
  let intensifierActive = false
  let negatorActive = false
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const prevWord = i > 0 ? words[i - 1] : ''
    
    // Check for negators in previous 3 words
    negatorActive = false
    for (let j = Math.max(0, i - 3); j < i; j++) {
      if (NEGATORS.has(words[j])) {
        negatorActive = true
        break
      }
    }
    
    // Check for intensifiers
    intensifierActive = INTENSIFIERS.has(prevWord)
    
    let wordScore = 0
    if (POSITIVE_WORDS.has(word)) {
      wordScore = 1
    } else if (NEGATIVE_WORDS.has(word)) {
      wordScore = -1
    }
    
    if (wordScore !== 0) {
      // Apply intensifier
      if (intensifierActive) {
        wordScore *= 1.5
      }
      
      // Apply negation
      if (negatorActive) {
        wordScore *= -0.5 // Partial reversal
      }
      
      score += wordScore
      wordCount++
    }
  }
  
  // Normalize score
  const normalizedScore = wordCount > 0 
    ? Math.max(-1, Math.min(1, score / Math.sqrt(wordCount)))
    : 0
  
  // Determine label
  const label: 'positive' | 'negative' | 'neutral' = 
    normalizedScore > 0.15 ? 'positive' :
    normalizedScore < -0.15 ? 'negative' : 
    'neutral'
  
  return { score: normalizedScore, label }
}

/**
 * Calculate relevance score based on ticker mention and content
 */
export function calculateRelevance(text: string, ticker: string, companyName?: string): number {
  if (!text) return 0
  
  const lowerText = text.toLowerCase()
  const lowerTicker = ticker.toLowerCase()
  
  let relevance = 0
  
  // Direct ticker mention
  if (lowerText.includes(lowerTicker) || text.includes(ticker.toUpperCase())) {
    relevance += 0.5
  }
  
  // Company name mention (if provided)
  if (companyName) {
    const nameParts = companyName.toLowerCase().split(/\s+/)
    for (const part of nameParts) {
      if (part.length > 3 && lowerText.includes(part)) {
        relevance += 0.3
        break
      }
    }
  }
  
  // Financial content keywords
  const financialTerms = ['stock', 'share', 'market', 'trade', 'price', 'earnings', 'revenue']
  for (const term of financialTerms) {
    if (lowerText.includes(term)) {
      relevance += 0.05
    }
  }
  
  return Math.min(1, relevance)
}

/**
 * Fetch news from NewsAPI
 */
export async function fetchNewsFromAPI(
  query: string,
  pageSize: number = 10
): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY
  
  if (!apiKey) {
    console.warn('[v0] NEWS_API_KEY not set, returning empty news')
    return []
  }
  
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://newsapi.org/v2/everything?q=${encodedQuery}&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FINPREDICT/1.0'
      },
      next: { revalidate: 1800 } // Cache for 30 minutes
    })
    
    if (!response.ok) {
      console.error(`[v0] NewsAPI error: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    
    if (data.status !== 'ok' || !data.articles) {
      return []
    }
    
    return data.articles.map((article: any) => {
      const text = `${article.title || ''} ${article.description || ''}`
      const { score, label } = analyzeSentiment(text)
      const relevance = calculateRelevance(text, query)
      
      return {
        title: article.title || '',
        description: article.description,
        source: article.source?.name || 'Unknown',
        url: article.url,
        publishedAt: article.publishedAt,
        sentimentScore: score,
        sentimentLabel: label,
        relevanceScore: relevance
      }
    })
  } catch (error) {
    console.error('[v0] Error fetching news:', error)
    return []
  }
}

/**
 * Get cached news sentiment from Supabase
 */
export async function getCachedSentiment(ticker: string): Promise<TickerSentiment | null> {
  const supabase = getSupabaseClient()
  
  // Get articles from last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const { data, error } = await supabase
    .from('news_sentiment')
    .select('*')
    .eq('ticker', ticker)
    .gte('fetched_at', oneDayAgo)
    .order('published_at', { ascending: false })
    .limit(20)
  
  if (error || !data || data.length === 0) {
    return null
  }
  
  const articles: NewsArticle[] = data.map(row => ({
    title: row.title,
    description: row.description,
    source: row.source,
    url: row.url,
    publishedAt: row.published_at,
    sentimentScore: parseFloat(row.sentiment_score) || 0,
    sentimentLabel: row.sentiment_label as 'positive' | 'negative' | 'neutral',
    relevanceScore: parseFloat(row.relevance_score) || 0
  }))
  
  // Calculate overall sentiment (weighted by relevance)
  let weightedSum = 0
  let totalWeight = 0
  
  for (const article of articles) {
    const weight = article.relevanceScore + 0.1 // Minimum weight
    weightedSum += article.sentimentScore * weight
    totalWeight += weight
  }
  
  const overallSentiment = totalWeight > 0 ? weightedSum / totalWeight : 0
  
  return {
    ticker,
    articles,
    overallSentiment,
    sentimentLabel: overallSentiment > 0.1 ? 'bullish' : overallSentiment < -0.1 ? 'bearish' : 'neutral',
    articleCount: articles.length,
    lastUpdated: data[0].fetched_at
  }
}

/**
 * Cache news articles to Supabase
 */
export async function cacheNewsArticles(
  ticker: string,
  articles: NewsArticle[]
): Promise<void> {
  const supabase = getSupabaseClient()
  
  const records = articles.map(article => ({
    ticker,
    title: article.title,
    description: article.description,
    source: article.source,
    url: article.url,
    published_at: article.publishedAt,
    sentiment_score: article.sentimentScore,
    sentiment_label: article.sentimentLabel,
    relevance_score: article.relevanceScore,
    fetched_at: new Date().toISOString()
  }))
  
  // Upsert to avoid duplicates
  const { error } = await supabase
    .from('news_sentiment')
    .upsert(records, {
      onConflict: 'ticker,url',
      ignoreDuplicates: true
    })
  
  if (error) {
    console.error('[v0] Error caching news:', error)
  }
}

/**
 * Get sentiment for a ticker (from cache or fetch fresh)
 */
export async function getTickerSentiment(
  ticker: string,
  companyName?: string,
  forceRefresh: boolean = false
): Promise<TickerSentiment> {
  // Check cache first
  if (!forceRefresh) {
    const cached = await getCachedSentiment(ticker)
    if (cached && cached.articleCount > 0) {
      return cached
    }
  }
  
  // Build search query
  const query = companyName 
    ? `"${ticker}" OR "${companyName}" stock`
    : `"${ticker}" stock`
  
  // Fetch fresh news
  const articles = await fetchNewsFromAPI(query, 15)
  
  // Update relevance scores with company name
  for (const article of articles) {
    article.relevanceScore = calculateRelevance(
      `${article.title} ${article.description || ''}`,
      ticker,
      companyName
    )
  }
  
  // Filter to relevant articles only
  const relevantArticles = articles.filter(a => a.relevanceScore >= 0.3)
  
  // Cache if we have articles
  if (relevantArticles.length > 0) {
    await cacheNewsArticles(ticker, relevantArticles)
  }
  
  // Calculate overall sentiment
  let weightedSum = 0
  let totalWeight = 0
  
  for (const article of relevantArticles) {
    const weight = article.relevanceScore + 0.1
    weightedSum += article.sentimentScore * weight
    totalWeight += weight
  }
  
  const overallSentiment = totalWeight > 0 ? weightedSum / totalWeight : 0
  
  return {
    ticker,
    articles: relevantArticles,
    overallSentiment,
    sentimentLabel: overallSentiment > 0.1 ? 'bullish' : overallSentiment < -0.1 ? 'bearish' : 'neutral',
    articleCount: relevantArticles.length,
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Get aggregated market sentiment from all cached news
 */
export async function getMarketSentiment(): Promise<{
  overallSentiment: number
  sentimentLabel: 'bullish' | 'bearish' | 'neutral'
  bullishTickers: string[]
  bearishTickers: string[]
  totalArticles: number
}> {
  const supabase = getSupabaseClient()
  
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const { data, error } = await supabase
    .from('news_sentiment')
    .select('ticker, sentiment_score, relevance_score')
    .gte('fetched_at', oneDayAgo)
  
  if (error || !data || data.length === 0) {
    return {
      overallSentiment: 0,
      sentimentLabel: 'neutral',
      bullishTickers: [],
      bearishTickers: [],
      totalArticles: 0
    }
  }
  
  // Aggregate by ticker
  const tickerSentiments = new Map<string, { sum: number; count: number }>()
  
  for (const row of data) {
    const current = tickerSentiments.get(row.ticker) || { sum: 0, count: 0 }
    current.sum += parseFloat(row.sentiment_score) || 0
    current.count++
    tickerSentiments.set(row.ticker, current)
  }
  
  let totalSentiment = 0
  let totalCount = 0
  const bullishTickers: string[] = []
  const bearishTickers: string[] = []
  
  for (const [ticker, data] of tickerSentiments) {
    const avgSentiment = data.sum / data.count
    totalSentiment += avgSentiment
    totalCount++
    
    if (avgSentiment > 0.15) {
      bullishTickers.push(ticker)
    } else if (avgSentiment < -0.15) {
      bearishTickers.push(ticker)
    }
  }
  
  const overallSentiment = totalCount > 0 ? totalSentiment / totalCount : 0
  
  return {
    overallSentiment,
    sentimentLabel: overallSentiment > 0.1 ? 'bullish' : overallSentiment < -0.1 ? 'bearish' : 'neutral',
    bullishTickers: bullishTickers.slice(0, 5),
    bearishTickers: bearishTickers.slice(0, 5),
    totalArticles: data.length
  }
}
