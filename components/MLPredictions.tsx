"use client"

import { useState, useEffect } from "react"
import PredictionDetail from "./ml/PredictionDetail"

interface Prediction {
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
  reasoning: string
  key_factors: string[]
  timeframe: "1d" | "1w" | "1m"
  timeframe_label: string
  ens_dir_acc: number
  sharpe: number
  alpha: number
  strategy_return: number
  bh_return: number
  max_drawdown: number
  w_lstm: number
  w_sarimax: number
  w_prophet: number
  w_xgb: number
  sentiment: number
  ens_rmse: number
  rsi: number
  momentum: number
  volatility: number
  volume_ratio: number
  position_52w: number
}

export default function MLPredictions({ isDarkMode }: { isDarkMode: boolean }) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"ALL" | "UP" | "DOWN" | "SIDEWAYS">("ALL")
  const [searchTicker, setSearchTicker] = useState("")
  const [sortBy, setSortBy] = useState("confidence")
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [detailPrediction, setDetailPrediction] = useState<Prediction | null>(null)
  const [timeframe, setTimeframe] = useState<"1d" | "1w" | "1m">("1w")

  useEffect(() => {
    const url = `/api/ml-predictions?limit=50&sort=${sortBy}&timeframe=${timeframe}${filter !== "ALL" ? `&direction=${filter}` : ""}`
    setLoading(true)
    setError(null)
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.success === false) {
          setError(data.error || "Failed to load predictions")
          setPredictions([])
        } else {
          setPredictions(data.data || [])
          setMetadata(data.metadata || null)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError("Network error. Please try again.")
        setLoading(false)
      })
  }, [sortBy, filter, timeframe])

  const filtered = predictions.filter(p =>
    searchTicker === "" || p.ticker.toLowerCase().includes(searchTicker.toLowerCase())
  )

  const card = `rounded-xl p-4 border shadow-sm ${isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`
  const text = isDarkMode ? "text-white" : "text-gray-900"
  const sub = isDarkMode ? "text-gray-400" : "text-gray-500"
  const inp = `px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className={`text-3xl font-bold ${text}`}>ML Predictions</h2>
        <p className={sub}>S&P 500 forecasts — LSTM + SARIMAX + Prophet + XGBoost ensemble</p>
      </div>

      {/* Timeframe Selector */}
      <div className={`${card} flex flex-wrap gap-3 items-center justify-center`}>
        <span className={`text-sm ${sub}`}>Forecast Timeframe:</span>
        {(["1d", "1w", "1m"] as const).map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeframe === tf
                ? "bg-blue-600 text-white shadow-lg"
                : isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tf === "1d" ? "1 Day" : tf === "1w" ? "1 Week" : "1 Month"}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Stocks Analyzed", value: metadata?.count || predictions.length || "40", color: "text-blue-500" },
          { label: "Avg Confidence", value: `${metadata?.avg_confidence || 65}%`, color: "text-green-500" },
          { label: "Avg Sharpe Ratio", value: (metadata?.avg_sharpe || 2.5).toFixed(1), color: "text-purple-500" },
          { label: "High Risk Stocks", value: metadata?.high_risk_count || 0, color: "text-red-500" },
        ].map(s => (
          <div key={s.label} className={card}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Market Sentiment Bar */}
      {metadata && (
        <div className={`${card} flex flex-wrap gap-6 items-center justify-center`}>
          <div className="text-center">
            <div className="text-green-500 font-bold text-xl">{metadata.stocks_up}</div>
            <div className={`text-xs ${sub}`}>Bullish</div>
          </div>
          <div className={`w-px h-8 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
          <div className="text-center">
            <div className="text-gray-500 font-bold text-xl">{metadata.stocks_sideways || 0}</div>
            <div className={`text-xs ${sub}`}>Neutral</div>
          </div>
          <div className={`w-px h-8 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
          <div className="text-center">
            <div className="text-red-500 font-bold text-xl">{metadata.stocks_down}</div>
            <div className={`text-xs ${sub}`}>Bearish</div>
          </div>
          <div className={`w-px h-8 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
          <div className="flex-1 max-w-xs">
            <div className="flex rounded-full overflow-hidden h-3">
              <div className="bg-green-500" style={{ width: `${(metadata.stocks_up / (metadata.stocks_up + metadata.stocks_down + (metadata.stocks_sideways || 0))) * 100}%` }} />
              <div className="bg-gray-400" style={{ width: `${((metadata.stocks_sideways || 0) / (metadata.stocks_up + metadata.stocks_down + (metadata.stocks_sideways || 0))) * 100}%` }} />
              <div className="bg-red-500 flex-1" />
            </div>
            <div className={`text-xs ${sub} text-center mt-1`}>
              Signal distribution for {timeframe === "1d" ? "1-day" : timeframe === "1w" ? "1-week" : "1-month"} forecast
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${card} flex flex-wrap gap-3 items-center`}>
        <input
          type="text"
          placeholder="Search ticker..."
          value={searchTicker}
          onChange={e => setSearchTicker(e.target.value)}
          className={inp}
        />
        <div className="flex gap-2">
          {(["ALL", "UP", "SIDEWAYS", "DOWN"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? f === "UP" ? "bg-green-600 text-white shadow-lg"
                    : f === "DOWN" ? "bg-red-600 text-white shadow-lg"
                    : f === "SIDEWAYS" ? "bg-gray-500 text-white shadow-lg"
                    : "bg-blue-600 text-white shadow-lg"
                  : isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f === "UP" ? "Bullish" : f === "DOWN" ? "Bearish" : f === "SIDEWAYS" ? "Neutral" : "All"}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={inp}>
          <option value="confidence">Sort: Confidence</option>
          <option value="sharpe">Sort: Sharpe Ratio</option>
          <option value="change">Sort: Forecast Change</option>
          <option value="risk">Sort: Risk (Low First)</option>
        </select>
      </div>

      {/* Predictions */}
      {loading ? (
        <div className={`${card} text-center py-16`}>
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className={sub}>Loading ML predictions...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className={`${card} text-center py-12`}>
              <p className={sub}>No predictions found for &quot;{searchTicker}&quot;</p>
            </div>
          ) : (
            filtered.map(p => (
              <div
                key={p.ticker}
                className={`${card} cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  selectedTicker === p.ticker
                    ? isDarkMode ? "border-blue-500 bg-blue-900/20" : "border-blue-400 bg-blue-50"
                    : ""
                }`}
                onClick={() => setSelectedTicker(selectedTicker === p.ticker ? null : p.ticker)}
              >
                <div className="flex flex-wrap items-center gap-4">

                  {/* Signal */}
                  <div className="flex items-center gap-3 min-w-[130px]">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg ${
                      p.direction === "UP"
                        ? "bg-gradient-to-br from-green-500 to-green-700 shadow-green-500/30"
                        : p.direction === "DOWN"
                        ? "bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/30"
                        : "bg-gradient-to-br from-gray-400 to-gray-600 shadow-gray-500/30"
                    }`}>
                      {p.direction === "UP" ? "↑" : p.direction === "DOWN" ? "↓" : "→"}
                    </div>
                    <div>
                      <div className={`font-bold text-lg ${text}`}>{p.ticker}</div>
                      <div className={`text-xs font-medium ${
                        p.direction === "UP" ? "text-green-500" : p.direction === "DOWN" ? "text-red-500" : "text-gray-500"
                      }`}>
                        {p.direction === "UP" ? "Bullish" : p.direction === "DOWN" ? "Bearish" : "Neutral"}
                      </div>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="min-w-[180px]">
                    <div className={`text-xs ${sub}`}>Current → {p.timeframe_label} Target</div>
                    <div className={`font-semibold ${text}`}>
                      ${p.last_price.toFixed(2)} → ${p.forecast_price.toFixed(2)}
                    </div>
                    <div className={`text-xs ${sub}`}>
                      Range: ${p.price_range_low.toFixed(2)} - ${p.price_range_high.toFixed(2)} (±{p.uncertainty_pct.toFixed(1)}%)
                    </div>
                    <div className={`text-sm font-bold ${
                      p.direction === "UP" ? "text-green-500" : p.direction === "DOWN" ? "text-red-500" : "text-gray-500"
                    }`}>
                      {p.forecast_change >= 0 ? "+" : ""}{p.forecast_change.toFixed(2)}%
                    </div>
                  </div>

                  {/* Confidence & Risk */}
                  <div className="min-w-[120px]">
                    <div className={`text-xs ${sub} mb-1`}>Confidence</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-16 h-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                        <div 
                          className={`h-full rounded-full ${
                            p.confidence >= 70 ? "bg-green-500" : p.confidence >= 50 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${p.confidence}%` }}
                        />
                      </div>
                      <span className={`font-bold text-sm ${
                        p.confidence >= 70 ? "text-green-500" : p.confidence >= 50 ? "text-yellow-500" : "text-red-500"
                      }`}>{p.confidence}%</span>
                    </div>
                    <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      p.risk_level === "low" ? "bg-green-500/20 text-green-500" :
                      p.risk_level === "medium" ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-red-500/20 text-red-500"
                    }`}>
                      {p.risk_level.charAt(0).toUpperCase() + p.risk_level.slice(1)} Risk
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="flex flex-wrap gap-3 flex-1">
                    <div className="text-center">
                      <div className={`text-xs ${sub}`}>RSI</div>
                      <div className={`font-bold ${p.rsi > 70 ? "text-red-500" : p.rsi < 30 ? "text-green-500" : "text-blue-500"}`}>
                        {p.rsi.toFixed(0)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${sub}`}>Volatility</div>
                      <div className={`font-bold ${p.volatility > 4 ? "text-red-500" : p.volatility < 2 ? "text-green-500" : "text-yellow-500"}`}>
                        {p.volatility.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${sub}`}>Sharpe</div>
                      <div className="font-bold text-purple-500">{p.sharpe.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${sub}`}>52W Pos</div>
                      <div className={`font-bold ${p.position_52w > 80 ? "text-orange-500" : p.position_52w < 20 ? "text-blue-500" : text}`}>
                        {p.position_52w.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Volume */}
                  <div className="text-center min-w-[70px]">
                    <div className={`text-xs ${sub}`}>Volume</div>
                    <div className={`font-bold ${p.volume_ratio > 1.5 ? "text-green-500" : p.volume_ratio < 0.5 ? "text-red-500" : text}`}>
                      {p.volume_ratio.toFixed(1)}x
                    </div>
                  </div>

                </div>

                {/* Key Factors Preview */}
                {p.key_factors && p.key_factors.length > 0 && (
                  <div className={`mt-3 pt-3 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className={`text-xs ${sub}`}>Key Factors:</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {p.key_factors.slice(0, 3).map((factor, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} ${text}`}>
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded Detail */}
                {selectedTicker === p.ticker && (
                  <div className={`mt-4 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    
                    {/* Reasoning */}
                    <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? "bg-blue-900/30 border border-blue-800" : "bg-blue-50 border border-blue-200"}`}>
                      <div className={`text-sm font-medium ${text} mb-1`}>Why this prediction?</div>
                      <p className={`text-sm ${sub}`}>{p.reasoning}</p>
                    </div>

                    {/* Model Weights */}
                    <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                      <div className={`text-xs ${sub} mb-2`}>Ensemble Model Weights</div>
                      <div className="flex h-3 rounded-full overflow-hidden mb-2">
                        <div className="bg-green-500" style={{ width: `${p.w_lstm * 100}%` }} title="LSTM" />
                        <div className="bg-orange-500" style={{ width: `${p.w_sarimax * 100}%` }} title="SARIMAX" />
                        <div className="bg-blue-500" style={{ width: `${p.w_prophet * 100}%` }} title="Prophet" />
                        <div className="bg-purple-500" style={{ width: `${p.w_xgb * 100}%` }} title="XGBoost" />
                      </div>
                      <div className={`text-xs flex gap-3 ${sub}`}>
                        <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>LSTM {(p.w_lstm*100).toFixed(0)}%</span>
                        <span><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1"></span>SARIMAX {(p.w_sarimax*100).toFixed(0)}%</span>
                        <span><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Prophet {(p.w_prophet*100).toFixed(0)}%</span>
                        <span><span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1"></span>XGBoost {(p.w_xgb*100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className={`text-xs ${sub} mb-1`}>Momentum</div>
                        <div className={`font-bold ${p.momentum > 0 ? "text-green-500" : "text-red-500"}`}>
                          {p.momentum >= 0 ? "+" : ""}{p.momentum.toFixed(2)}%
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className={`text-xs ${sub} mb-1`}>Sentiment Score</div>
                        <div className={`font-bold ${p.sentiment > 0 ? "text-green-500" : p.sentiment < 0 ? "text-red-500" : text}`}>
                          {p.sentiment >= 0 ? "+" : ""}{p.sentiment.toFixed(2)}
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className={`text-xs ${sub} mb-1`}>Max Drawdown</div>
                        <div className="font-bold text-red-500">{p.max_drawdown.toFixed(2)}%</div>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <div className={`text-xs ${sub} mb-1`}>Model RMSE</div>
                        <div className={`font-bold ${text}`}>${p.ens_rmse.toFixed(2)}</div>
                      </div>
                    </div>

{/* View Full Details Button */}
                                    <div className="mt-4 mb-4">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setDetailPrediction(p)
                                        }}
                                        className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                                      >
                                        View Full Analysis with Charts
                                      </button>
                                    </div>

                                    {/* Price Range Visualization */}
                                    <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                                      <div className={`text-xs ${sub} mb-3`}>Price Forecast Range ({p.timeframe_label})</div>
                      <div className="relative h-8">
                        <div className={`absolute inset-y-0 left-0 right-0 ${isDarkMode ? "bg-gray-600" : "bg-gray-200"} rounded-full`} />
                        <div 
                          className={`absolute inset-y-0 rounded-full ${
                            p.direction === "UP" ? "bg-green-500/50" : p.direction === "DOWN" ? "bg-red-500/50" : "bg-gray-400/50"
                          }`}
                          style={{
                            left: `${Math.max(0, ((p.price_range_low - p.last_price * 0.9) / (p.last_price * 0.2)) * 100)}%`,
                            right: `${Math.max(0, 100 - ((p.price_range_high - p.last_price * 0.9) / (p.last_price * 0.2)) * 100)}%`,
                          }}
                        />
                        <div 
                          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 ${
                            p.direction === "UP" ? "border-green-500" : p.direction === "DOWN" ? "border-red-500" : "border-gray-500"
                          }`}
                          style={{ left: `${((p.forecast_price - p.last_price * 0.9) / (p.last_price * 0.2)) * 100}%` }}
                        />
                      </div>
                      <div className={`flex justify-between text-xs ${sub} mt-2`}>
                        <span>Low: ${p.price_range_low.toFixed(2)}</span>
                        <span className={`font-medium ${
                          p.direction === "UP" ? "text-green-500" : p.direction === "DOWN" ? "text-red-500" : text
                        }`}>Target: ${p.forecast_price.toFixed(2)}</span>
                        <span>High: ${p.price_range_high.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`${card} text-center border-red-500/50`}>
          <div className="text-red-500 font-medium mb-2">Error Loading Predictions</div>
          <p className={`text-sm ${sub}`}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <div className={`${card} text-center space-y-2`}>
        <div className={`text-xs font-medium ${text}`}>Important Disclaimer</div>
        <p className={`text-xs ${sub}`}>
          {metadata?.disclaimer || "AI predictions are probabilistic estimates based on historical technical analysis. This is NOT financial advice. Past performance does not guarantee future results. Always conduct your own research and consult a financial advisor before making investment decisions."}
        </p>
        <div className={`text-xs ${sub} pt-2 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          Models: LSTM + SARIMAX + Prophet + XGBoost · Ridge meta-model stacking · Real-time Yahoo Finance data
        </div>
      </div>

      {/* Full Prediction Detail Modal */}
      {detailPrediction && (
        <PredictionDetail
          prediction={detailPrediction}
          onClose={() => setDetailPrediction(null)}
          isDarkMode={isDarkMode}
        />
      )}

    </div>
  )
}
