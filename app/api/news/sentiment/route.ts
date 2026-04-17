import { NextResponse } from "next/server"
import { getTickerSentiment } from "@/lib/ml/news-sentiment"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get("ticker")
    
    if (!ticker) {
      return NextResponse.json(
        { error: "ticker parameter is required" },
        { status: 400 }
      )
    }
    
    const sentiment = await getTickerSentiment(ticker.toUpperCase())
    
    return NextResponse.json({
      success: true,
      ticker: sentiment.ticker,
      overallSentiment: sentiment.overallSentiment,
      sentimentLabel: sentiment.sentimentLabel,
      articleCount: sentiment.articleCount,
      lastUpdated: sentiment.lastUpdated,
      articles: sentiment.articles.map(article => ({
        title: article.title,
        description: article.description,
        source: article.source,
        url: article.url,
        publishedAt: article.publishedAt,
        sentimentScore: article.sentimentScore,
        sentimentLabel: article.sentimentLabel
      }))
    })
  } catch (error) {
    console.error("[v0] News sentiment API error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch news sentiment",
        articles: []
      },
      { status: 500 }
    )
  }
}
