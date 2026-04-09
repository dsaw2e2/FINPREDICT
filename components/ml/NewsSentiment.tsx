"use client"

import { useState, useEffect } from "react"
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface NewsArticle {
  title: string
  description: string | null
  source: string
  url: string
  publishedAt: string
  sentimentScore: number
  sentimentLabel: "positive" | "negative" | "neutral"
}

interface NewsSentimentProps {
  ticker: string
  sentimentScore?: number | null
}

export default function NewsSentiment({ ticker, sentimentScore }: NewsSentimentProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/news/sentiment?ticker=${ticker}`)
        if (!response.ok) throw new Error("Failed to fetch news")
        
        const data = await response.json()
        setArticles(data.articles || [])
      } catch (err) {
        // If API fails, show placeholder
        setError("News data unavailable")
        setArticles([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchNews()
  }, [ticker])

  const getSentimentColor = (score: number) => {
    if (score > 0.15) return "text-emerald-500"
    if (score < -0.15) return "text-red-500"
    return "text-amber-500"
  }

  const getSentimentIcon = (score: number) => {
    if (score > 0.15) return <TrendingUp className="w-4 h-4 text-emerald-500" />
    if (score < -0.15) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-amber-500" />
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Calculate overall sentiment
  const overallSentiment = sentimentScore ?? (
    articles.length > 0 
      ? articles.reduce((sum, a) => sum + a.sentimentScore, 0) / articles.length
      : 0
  )

  const sentimentLabel = overallSentiment > 0.1 ? "Bullish" : overallSentiment < -0.1 ? "Bearish" : "Neutral"

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">News Sentiment</h3>
          <p className="text-sm text-muted-foreground">
            Recent news analysis for {ticker}
          </p>
        </div>
        {!loading && !error && (
          <div className="flex items-center gap-2">
            {getSentimentIcon(overallSentiment)}
            <span className={`text-lg font-bold ${getSentimentColor(overallSentiment)}`}>
              {sentimentLabel}
            </span>
          </div>
        )}
      </div>

      {/* Sentiment gauge */}
      {!loading && !error && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Bearish</span>
            <span>Neutral</span>
            <span>Bullish</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
            <div className="bg-red-500/60 w-1/3" />
            <div className="bg-amber-500/60 w-1/3" />
            <div className="bg-emerald-500/60 w-1/3" />
          </div>
          <div 
            className="relative h-0"
            style={{ top: "-14px" }}
          >
            <div 
              className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full -translate-x-1/2 transition-all"
              style={{ 
                left: `${Math.min(100, Math.max(0, (overallSentiment + 1) * 50))}%` 
              }}
            />
          </div>
          <div className="text-center mt-3">
            <span className={`text-sm font-medium ${getSentimentColor(overallSentiment)}`}>
              Score: {(overallSentiment * 100).toFixed(0)}
            </span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
              <div className="h-3 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Set NEWS_API_KEY to enable news sentiment
          </p>
        </div>
      )}

      {/* Articles list */}
      {!loading && !error && articles.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground">Recent Headlines</h4>
          {articles.slice(0, 5).map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {article.source}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className={`text-xs ${getSentimentColor(article.sentimentScore)}`}>
                      {article.sentimentLabel}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* No articles */}
      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">
            No recent news articles found for {ticker}
          </p>
        </div>
      )}
    </div>
  )
}
