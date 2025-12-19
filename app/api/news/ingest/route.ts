import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { parseRSSFeed, fetchYahooFinanceNews, generateContentHash, type NewsArticle } from "@/lib/news-parsers"

export const runtime = "edge"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    console.log("[v0] Starting news ingestion...")

    const supabase = createServerClient()

    const { data: sources, error: sourcesError } = await supabase.from("news_sources").select("*").eq("is_active", true)

    if (sourcesError && sourcesError.message.includes("does not exist")) {
      console.log("[v0] News tables not created yet. Please run scripts/create_news_tables.sql")
      return NextResponse.json({
        success: false,
        error: "Database tables not initialized. Run scripts/create_news_tables.sql in your Supabase project.",
        setup_required: true,
      })
    }

    if (sourcesError) throw sourcesError

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

        await supabase.from("news_sources").update({ last_fetched_at: new Date().toISOString() }).eq("id", source.id)
      }
    }

    console.log("[v0] Fetching from Yahoo Finance...")
    const yahooArticles = await fetchYahooFinanceNews(trackedTickers)
    allArticles.push(...yahooArticles)

    console.log(`[v0] Total articles fetched: ${allArticles.length}`)

    const uniqueArticles = allArticles.filter((article, index, self) => {
      const hash = generateContentHash(article)
      return index === self.findIndex((a) => generateContentHash(a) === hash)
    })

    console.log(`[v0] Unique articles after deduplication: ${uniqueArticles.length}`)

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
