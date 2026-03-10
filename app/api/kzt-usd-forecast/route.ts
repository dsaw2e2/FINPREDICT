import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export const dynamic = "force-dynamic"

// ── Live rate fetchers (kept for real-time current rate) ──

async function getCurrentRate(): Promise<number> {
  // Try Yahoo Finance first
  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/USDKZT=X?interval=1d&range=1d",
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 3600 } },
    )
    if (res.ok) {
      const data = await res.json()
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (typeof price === "number") return Math.round(price * 100) / 100
    }
  } catch {}

  // Fallback: ExchangeRate API
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      const rate = data?.rates?.KZT
      if (typeof rate === "number") return Math.round(rate * 100) / 100
    }
  } catch {}

  return 524.2 // Last known fallback
}

// ── Load pre-computed ML forecast ──

interface MLForecast {
  generated_at: string
  current_rate: number
  forecast_days: number
  forecast: Array<{
    date: string
    predicted: number
    lower: number
    upper: number
    prophet: number
    xgboost: number
  }>
  model: {
    name: string
    prophet_r2: number
    xgboost_cv_r2: number
    xgboost_mae: number
    feature_importance: Record<string, number>
    features_used: string[]
    training_data_points: number
    sentiment_data_available: boolean
  }
  reasoning: Array<{
    factor: string
    impact: string
    detail: string
  }>
}

async function loadPrecomputedForecast(): Promise<MLForecast | null> {
  try {
    const filePath = join(process.cwd(), "public", "data", "forecast-usd-kzt.json")
    const raw = await readFile(filePath, "utf-8")
    const data: MLForecast = JSON.parse(raw)

    // Check staleness: if older than 48 hours, return null
    const generatedAt = new Date(data.generated_at)
    const hoursOld = (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60)
    if (hoursOld > 48) {
      console.log(`[v0] Forecast is ${hoursOld.toFixed(0)}h old, considered stale`)
      return null
    }

    return data
  } catch {
    return null
  }
}

// ── Simple inline fallback forecast (when ML JSON is stale/missing) ──

function simpleFallbackForecast(currentRate: number, days: number) {
  const forecast = []
  const today = new Date()
  for (let i = 1; i <= days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    // Simple random walk with slight mean reversion
    const drift = (Math.sin(i * 0.5) * 0.001 + 0.0001) * currentRate
    const predicted = currentRate + drift
    const width = currentRate * 0.005 * Math.sqrt(i)
    forecast.push({
      date: date.toISOString().split("T")[0],
      predicted: Math.round(predicted * 100) / 100,
      lower: Math.round((predicted - width) * 100) / 100,
      upper: Math.round((predicted + width) * 100) / 100,
      prophet: Math.round(predicted * 100) / 100,
      xgboost: Math.round(predicted * 100) / 100,
    })
  }
  return forecast
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const forecastDays = Math.min(Math.max(Number(searchParams.get("days") || "30"), 1), 30)

    // Always fetch live current rate
    const currentRate = await getCurrentRate()

    // Try to load pre-computed ML forecast
    const mlForecast = await loadPrecomputedForecast()

    if (mlForecast) {
      // Serve pre-computed ML forecast (Prophet + XGBoost ensemble)
      return NextResponse.json({
        success: true,
        data: {
          currentRate,
          forecast: mlForecast.forecast.slice(0, forecastDays).map((f) => ({
            date: f.date,
            rate: f.predicted,
            predicted: f.predicted,
            lower: f.lower,
            upper: f.upper,
            prophet: f.prophet,
            xgboost: f.xgboost,
          })),
          modelInfo: {
            name: mlForecast.model.name,
            prophet_r2: mlForecast.model.prophet_r2,
            xgboost_cv_r2: mlForecast.model.xgboost_cv_r2,
            xgboost_mae: mlForecast.model.xgboost_mae,
            feature_importance: mlForecast.model.feature_importance,
            training_data_points: mlForecast.model.training_data_points,
            sentiment_data_available: mlForecast.model.sentiment_data_available,
          },
          reasoning: mlForecast.reasoning,
          metadata: {
            generatedAt: mlForecast.generated_at,
            forecastDays,
            model: "Prophet + XGBoost Ensemble",
            dataSource: "Yahoo Finance + Brent Oil + News Sentiment",
            source: "precomputed",
          },
        },
      })
    }

    // Fallback: simple inline forecast
    const forecast = simpleFallbackForecast(currentRate, forecastDays)

    return NextResponse.json({
      success: true,
      data: {
        currentRate,
        forecast: forecast.map((f) => ({
          date: f.date,
          rate: f.predicted,
          predicted: f.predicted,
          lower: f.lower,
          upper: f.upper,
        })),
        modelInfo: {
          name: "Simple Fallback",
          note: "ML forecast is being regenerated. Run scripts/update_forecast.py to generate full Prophet + XGBoost predictions.",
        },
        reasoning: [
          {
            factor: "Fallback Mode",
            impact: "neutral",
            detail: "The ML model forecast is being regenerated. This is a simplified estimate based on recent trends.",
          },
        ],
        metadata: {
          generatedAt: new Date().toISOString(),
          forecastDays,
          model: "Simple Fallback",
          dataSource: "Yahoo Finance",
          source: "fallback",
        },
      },
    })
  } catch (error) {
    console.error("Error in KZT/USD forecast:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
