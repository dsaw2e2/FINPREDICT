import { NextResponse } from "next/server"
import { parseRSSFeed, fetchYahooFinanceNews, fetchNewsAPI, type NewsArticle } from "@/lib/news-parsers"

export const runtime = "edge"
export const revalidate = 300 // Cache for 5 minutes

const RSS_FEEDS = [
  { url: "https://feeds.bloomberg.com/markets/news.rss", name: "Bloomberg" },
  { url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", name: "CNBC" },
  { url: "https://www.investing.com/rss/news.rss", name: "Investing.com" },
]

const POPULAR_TICKERS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA", "META", "XOM", "CVX", "SHEL"]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const ticker = searchParams.get("ticker")
    const source = searchParams.get("source")
    const sentiment = searchParams.get("sentiment")

    console.log("[v0] Fetching real news from RSS feeds and APIs...")

    const newsPromises: Promise<NewsArticle[]>[] = []

    // Fetch from RSS feeds
    for (const feed of RSS_FEEDS) {
      newsPromises.push(parseRSSFeed(feed.url, feed.name))
    }

    // Fetch from Yahoo Finance
    newsPromises.push(fetchYahooFinanceNews(POPULAR_TICKERS))

    // Fetch from NewsAPI if key available
    const newsApiKey = process.env.NEWS_API_KEY
    if (newsApiKey) {
      newsPromises.push(fetchNewsAPI(newsApiKey, POPULAR_TICKERS))
    }

    const newsArrays = await Promise.all(newsPromises)
    const allArticles = newsArrays.flat()

    console.log(`[v0] Fetched ${allArticles.length} articles from all sources`)

    // Remove duplicates
    const uniqueArticles = Array.from(new Map(allArticles.map((article) => [article.url, article])).values())

    // Sort by publish date
    uniqueArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

    // Apply filters
    let filtered = uniqueArticles

    if (ticker) {
      filtered = filtered.filter((article) => article.tickers?.includes(ticker))
    }

    if (source) {
      filtered = filtered.filter((article) => article.source === source)
    }

    if (sentiment) {
      filtered = filtered.filter((article) => article.sentiment === sentiment)
    }

    // Paginate
    const start = (page - 1) * limit
    const end = page * limit
    const paginatedData = filtered.slice(start, end)

    const transformedArticles = paginatedData.map((article, index) => ({
      id: `${Date.now()}-${index}`,
      title: article.title,
      summary: article.description || "",
      url: article.url,
      source: article.source,
      source_logo: article.sourceLogo,
      image_url:
        article.imageUrl ||
        `https://placeholder.svg?height=200&width=400&query=${encodeURIComponent(article.title.split(" ").slice(0, 3).join("+"))}`,
      published_at: article.publishedAt.toISOString(),
      tickers: article.tickers || [],
      sentiment: article.sentiment || "neutral",
    }))

    console.log(`[v0] Returning ${transformedArticles.length} articles after filtering`)

    return NextResponse.json({
      success: true,
      articles: transformedArticles,
      pagination: {
        page,
        limit,
        total: filtered.length,
        total_pages: Math.ceil(filtered.length / limit),
      },
      last_updated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] News list error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        articles: [],
        pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
      },
      { status: 500 },
    )
  }
}
