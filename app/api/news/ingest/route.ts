import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  parseRSSFeed,
  fetchYahooFinanceNews,
  fetchNewsAPI,
  generateContentHash,
  type NewsArticle,
} from "@/lib/news-parsers"

export const runtime = "edge"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    console.log("[v0] Starting news ingestion...")

    const supabase = createServerClient()

    // Fetch active sources
    const { data: sources, error: sourcesError } = await supabase.from("news_sources").select("*").eq("is_active", true)

    if (sourcesError) throw sourcesError

    // Fetch tracked tickers
    const { data: tickers, error: tickersError } = await supabase
      .from("tracked_tickers")
      .select("ticker")
      .eq("is_active", true)

    if (tickersError) throw tickersError

    const trackedTickers = tickers?.map((t) => t.ticker) || []

    const allArticles: NewsArticle[] = []

    // Parse RSS feeds
    for (const source of sources || []) {
      if (source.parse_method === "rss" && source.feed_url) {
        console.log(`[v0] Fetching RSS from ${source.name}...`)
        const articles = await parseRSSFeed(source.feed_url, source.name)
        allArticles.push(...articles)

        // Update last_fetched_at
        await supabase.from("news_sources").update({ last_fetched_at: new Date().toISOString() }).eq("id", source.id)
      }
    }

    // Fetch from Yahoo Finance
    console.log("[v0] Fetching from Yahoo Finance...")
    const yahooArticles = await fetchYahooFinanceNews(trackedTickers)
    allArticles.push(...yahooArticles)

    // Fetch from NewsAPI if API key is available
    const newsApiKey = process.env.NEWS_API_KEY
    if (newsApiKey) {
      console.log("[v0] Fetching from NewsAPI...")
      const newsApiArticles = await fetchNewsAPI(newsApiKey, trackedTickers)
      allArticles.push(...newsApiArticles)
    }

    console.log(`[v0] Total articles fetched: ${allArticles.length}`)

    // Remove duplicates and prepare for insertion
    const uniqueArticles = allArticles.filter((article, index, self) => {
      const hash = generateContentHash(article)
      return index === self.findIndex((a) => generateContentHash(a) === hash)
    })

    console.log(`[v0] Unique articles after deduplication: ${uniqueArticles.length}`)

    // Insert into database (ignore conflicts)
    let insertedCount = 0
    for (const article of uniqueArticles) {
      const { error } = await supabase
        .from("news_articles")
        .insert({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source,
          source_logo: article.sourceLogo,
          image_url: article.imageUrl,
          published_at: article.publishedAt.toISOString(),
          tickers: article.tickers,
          category: article.category,
          sentiment: article.sentiment,
          content_hash: generateContentHash(article),
        })
        .select()

      if (!error) insertedCount++
    }

    console.log(`[v0] Successfully inserted ${insertedCount} new articles`)

    return NextResponse.json({
      success: true,
      message: `Ingested ${insertedCount} new articles out of ${uniqueArticles.length} unique articles`,
      total_fetched: allArticles.length,
      unique_articles: uniqueArticles.length,
      inserted: insertedCount,
    })
  } catch (error) {
    console.error("[v0] News ingestion error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
