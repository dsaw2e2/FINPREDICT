"use client"

import EnsembleChart from "./EnsembleChart"
import ModelWeights from "./ModelWeights"
import ConfidenceGauge from "./ConfidenceGauge"
import TechnicalIndicators from "./TechnicalIndicators"
import NewsSentiment from "./NewsSentiment"
import { X } from "lucide-react"

interface PredictionDetailProps {
  prediction: {
    ticker: string
    last_price: number
    forecast_price: number
    forecast_change: number
    price_range_low: number
    price_range_high: number
    uncertainty_pct: number
    direction: "UP" | "DOWN" | "SIDEWAYS"
    confidence: number
    risk_level: "low" | "medium" | "high"
    reasoning?: string
    key_factors?: string[]
    timeframe: "1d" | "1w" | "1m"
    // Model data
    w_sarimax?: number
    w_prophet?: number
    w_xgboost?: number
    pred_sarimax?: number | null
    pred_prophet?: number | null
    pred_xgboost?: number | null
    // Technical indicators
    rsi?: number | null
    macd?: number | null
    macd_signal?: number | null
    sma_20?: number | null
    sma_50?: number | null
    ema_12?: number | null
    ema_26?: number | null
    bollinger_upper?: number | null
    bollinger_lower?: number | null
    atr?: number | null
    volatility?: number | null
    momentum?: number | null
    volume_ratio?: number | null
    position_52w?: number | null
    // Sentiment
    sentiment?: number | null
  }
  onClose: () => void
}

export default function PredictionDetail({ prediction, onClose }: PredictionDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-background/95 backdrop-blur">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{prediction.ticker}</h2>
            <p className="text-sm text-muted-foreground">
              {prediction.timeframe === "1d" ? "1-Day" : prediction.timeframe === "1w" ? "1-Week" : "1-Month"} Ensemble Forecast
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Ensemble Chart */}
            <EnsembleChart
              currentPrice={prediction.last_price}
              forecastPrice={prediction.forecast_price}
              priceRangeLow={prediction.price_range_low}
              priceRangeHigh={prediction.price_range_high}
              predSarimax={prediction.pred_sarimax ?? null}
              predProphet={prediction.pred_prophet ?? null}
              predXgboost={prediction.pred_xgboost ?? null}
              timeframe={prediction.timeframe}
              ticker={prediction.ticker}
            />

            {/* Model Weights */}
            <ModelWeights
              wSarimax={prediction.w_sarimax ?? 0.33}
              wProphet={prediction.w_prophet ?? 0.33}
              wXgboost={prediction.w_xgboost ?? 0.34}
              predSarimax={prediction.pred_sarimax ?? null}
              predProphet={prediction.pred_prophet ?? null}
              predXgboost={prediction.pred_xgboost ?? null}
              currentPrice={prediction.last_price}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Confidence Gauge */}
            <ConfidenceGauge
              confidence={prediction.confidence}
              direction={prediction.direction}
              riskLevel={prediction.risk_level}
              reasoning={prediction.reasoning}
              keyFactors={prediction.key_factors}
            />

            {/* Technical Indicators */}
            <TechnicalIndicators
              rsi={prediction.rsi ?? null}
              macd={prediction.macd ?? null}
              macdSignal={prediction.macd_signal ?? null}
              sma20={prediction.sma_20 ?? null}
              sma50={prediction.sma_50 ?? null}
              bollingerUpper={prediction.bollinger_upper ?? null}
              bollingerLower={prediction.bollinger_lower ?? null}
              atr={prediction.atr ?? null}
              volatility={prediction.volatility ?? null}
              momentum={prediction.momentum ?? null}
              volumeRatio={prediction.volume_ratio ?? null}
              position52w={prediction.position_52w ?? null}
              currentPrice={prediction.last_price}
            />

            {/* News Sentiment */}
            <NewsSentiment
              ticker={prediction.ticker}
              sentimentScore={prediction.sentiment}
            />
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <p className="text-xs text-muted-foreground text-center">
            AI predictions are probabilistic estimates based on historical data and technical analysis. 
            This is not financial advice. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  )
}
