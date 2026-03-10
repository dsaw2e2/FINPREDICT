import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { parseRSSFeed, fetchYahooFinanceNews, generateContentHash, type NewsArticle } from "@/lib/news-parsers"
import { generateText, Output } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

export const revalidate = 0

const sentimentSchema = z.object({
  sentiment_score: z.number().min(-1).max(1),
  impact_reasoning: z.string(),
  category: z.enum(["energy", "macro", "geopolitical", "market", "other"]),
})

async function analyzeSentiment(
  title: string,
  description: string | undefined,
): Promise<{ sentiment_score: number; impact_reasoning: string; category: string } | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) return null

  try {
    const google = createGoogleGenerativeAI({ apiKey })
    const result = await generateText({
      model: google("gemini-2.0-flash"),
      output: Output.object({ schema: sentimentSchema }),
      prompt: `Analyze this financial news article for its impact on the Kazakhstan Tenge (KZT) and energy markets.

Title: ${title}
${description ? `Description: ${description}` : ""}

Score from -1.0 (very bearish for KZT / negative for energy markets) to +1.0 (very bullish for KZT / positive for energy markets).
Consider: oil price impact, geopolitical stability, trade flows, sanctions, OPEC decisions, renewable energy shifts.
Provide a brief 1-sentence reasoning for your score.
Categorize as: energy, macro, geopolitical, market, or other.`,
    })

    return result.output ?? null
  } catch (error) {
    console.error("[v0] Sentiment analysis failed:", error instanceof Error ? error.message : error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    console.log("[v0] Starting news ingestion with sentiment analysis...")

    const supabase = createServerClient()

    const { data: sources, error: sourcesError } = await supabase.from("news_sources").select("*").eq("is_active", true)

    if (sourcesError && sourcesError.message.includes("does not exist")) {
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
        const articles = await parseRSSFeed(source.feed_url, source.name)
        allArticles.push(...articles)
        await supabase.from("news_sources").update({ last_fetched_at: new Date().toISOString() }).eq("id", source.id)
      }
    }

    const yahooArticles = await fetchYahooFinanceNews(trackedTickers)
    allArticles.push(...yahooArticles)

    const uniqueArticles = allArticles.filter((article, index, self) => {
      const hash = generateContentHash(article)
      return index === self.findIndex((a) => generateContentHash(a) === hash)
    })

    console.log(`[v0] ${uniqueArticles.length} unique articles to process`)

    let insertedCount = 0
    let sentimentCount = 0

    for (const article of uniqueArticles) {
      // Run sentiment analysis via Gemini
      const sentiment = await analyzeSentiment(article.title, article.description)
      if (sentiment) sentimentCount++

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
          category: sentiment?.category ?? article.category,
          sentiment: sentiment
            ? sentiment.sentiment_score > 0.2
              ? "positive"
              : sentiment.sentiment_score < -0.2
                ? "negative"
                : "neutral"
            : article.sentiment,
          sentiment_score: sentiment?.sentiment_score ?? null,
          impact_reasoning: sentiment?.impact_reasoning ?? null,
          sentiment_model: sentiment ? "gemini-2.0-flash" : null,
          content_hash: generateContentHash(article),
        })
        .select()

      if (!error) insertedCount++

      // Small delay to avoid Gemini rate limits
      if (sentiment) await new Promise((r) => setTimeout(r, 200))
    }

    // Refresh the daily_sentiment materialized view
    try {
      await supabase.rpc("refresh_daily_sentiment")
    } catch {
      console.log("[v0] Could not refresh daily_sentiment view (may not exist yet)")
    }

    console.log(`[v0] Inserted ${insertedCount} articles, ${sentimentCount} with sentiment`)

    return NextResponse.json({
      success: true,
      message: `Ingested ${insertedCount} articles, ${sentimentCount} analyzed with AI sentiment`,
      total_fetched: allArticles.length,
      unique_articles: uniqueArticles.length,
      inserted: insertedCount,
      sentiment_analyzed: sentimentCount,
    })
  } catch (error) {
    console.error("[v0] News ingestion error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
