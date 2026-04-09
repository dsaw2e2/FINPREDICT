// Use Web Crypto API for edge compatibility
function generateHash(content: string): string {
  // Simple hash function for client/edge compatibility
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

export interface NewsArticle {
  title: string
  description?: string
  url: string
  source: string
  sourceLogo?: string
  imageUrl?: string
  publishedAt: Date
  tickers?: string[]
  category?: string
  sentiment?: "positive" | "negative" | "neutral"
}

// RSS Parser
export async function parseRSSFeed(feedUrl: string, sourceName: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FinPredict/1.0;)",
      },
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const xml = await response.text()
    const articles: NewsArticle[] = []

    // Parse RSS items
    const itemRegex = /<item>(.*?)<\/item>/gs
    const items = xml.match(itemRegex) || []

    for (const item of items.slice(0, 20)) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1]
      const link = item.match(/<link>(.*?)<\/link>/)?.[1]
      const description =
        item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
        item.match(/<description>(.*?)<\/description>/)?.[1]
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]
      const imageUrl = item.match(/<media:thumbnail url="(.*?)"/)?.[1] || item.match(/<enclosure.*?url="(.*?)"/)?.[1]

      if (title && link) {
        articles.push({
          title: title.trim(),
          description: description?.replace(/<[^>]*>/g, "").trim(),
          url: link.trim(),
          source: sourceName,
          imageUrl,
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
          tickers: extractTickers(title + " " + (description || "")),
        })
      }
    }

    return articles
  } catch (error) {
    console.error(`[v0] RSS parse error for ${sourceName}:`, error)
    return []
  }
}

// Yahoo Finance News API
export async function fetchYahooFinanceNews(tickers: string[]): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = []

  for (const ticker of tickers.slice(0, 10)) {
    try {
      const response = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${ticker}&newsCount=5`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FinPredict/1.0;)",
        },
      })

      if (!response.ok) continue

      const data = await response.json()
      const news = data.news || []

      for (const item of news) {
        articles.push({
          title: item.title,
          description: item.summary,
          url: item.link,
          source: "Yahoo Finance",
          sourceLogo: "https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo.png",
          imageUrl: item.thumbnail?.resolutions?.[0]?.url,
          publishedAt: new Date(item.providerPublishTime * 1000),
          tickers: [ticker],
          sentiment: analyzeSentiment(item.title + " " + (item.summary || "")),
        })
      }
    } catch (error) {
      console.error(`[v0] Yahoo Finance error for ${ticker}:`, error)
    }
  }

  return articles
}

// Extract tickers from text
function extractTickers(text: string): string[] {
  const tickers: string[] = []
  const tickerMap: Record<string, string> = {
    apple: "AAPL",
    microsoft: "MSFT",
    google: "GOOGL",
    alphabet: "GOOGL",
    amazon: "AMZN",
    tesla: "TSLA",
    meta: "META",
    facebook: "META",
    nvidia: "NVDA",
    berkshire: "BRK.B",
    jpmorgan: "JPM",
    visa: "V",
    exxon: "XOM",
    shell: "SHEL",
    bp: "BP",
    totalenergies: "TTE",
    chevron: "CVX",
  }

  const lowerText = text.toLowerCase()

  // Check for explicit ticker symbols ($AAPL or AAPL:)
  const explicitTickers = text.match(/\$?[A-Z]{1,5}(?=\s|:|,|\.)/g)
  if (explicitTickers) {
    tickers.push(...explicitTickers.map((t) => t.replace("$", "")))
  }

  // Check for company names
  for (const [name, ticker] of Object.entries(tickerMap)) {
    if (lowerText.includes(name)) {
      tickers.push(ticker)
    }
  }

  return [...new Set(tickers)]
}

// Simple sentiment analysis
function analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
  const lowerText = text.toLowerCase()

  const positiveWords = [
    "surge",
    "gain",
    "up",
    "rise",
    "rally",
    "jump",
    "soar",
    "boost",
    "profit",
    "growth",
    "strong",
    "beat",
    "outperform",
  ]
  const negativeWords = [
    "fall",
    "drop",
    "down",
    "decline",
    "plunge",
    "crash",
    "loss",
    "weak",
    "miss",
    "underperform",
    "cut",
    "slash",
  ]

  const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length

  if (positiveCount > negativeCount) return "positive"
  if (negativeCount > positiveCount) return "negative"
  return "neutral"
}

// Generate content hash for deduplication
export function generateContentHash(article: NewsArticle): string {
  const content = `${article.title}|${article.url}`
  return generateHash(content)
}

// Check if article is duplicate
export function isDuplicate(articles: NewsArticle[], newArticle: NewsArticle): boolean {
  const newHash = generateContentHash(newArticle)
  return articles.some((article) => generateContentHash(article) === newHash)
}
