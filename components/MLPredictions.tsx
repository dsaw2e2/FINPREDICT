"use client"

import { useState, useEffect } from "react"

interface Prediction {
  ticker: string
  last_price: number
  forecast_price: number
  forecast_change: number
  direction: "UP" | "DOWN"
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
}

export default function MLPredictions({ isDarkMode }: { isDarkMode: boolean }) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "UP" | "DOWN">("ALL")
  const [searchTicker, setSearchTicker] = useState("")
  const [sortBy, setSortBy] = useState("sharpe")
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)

  useEffect(() => {
    const url = `/api/ml-predictions?limit=50&sort=${sortBy}${filter !== "ALL" ? `&direction=${filter}` : ""}`
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setPredictions(data.data || [])
        setMetadata(data.metadata || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [sortBy, filter])

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
        <h2 className={`text-3xl font-bold ${text}`}>🤖 ML Predictions</h2>
        <p className={sub}>S&P 500 forecasts — LSTM + SARIMAX + Prophet + XGBoost ensemble</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Stocks Analyzed", value: "497", color: "text-blue-500", icon: "📊" },
          { label: "Avg Dir Accuracy", value: "83.5%", color: "text-green-500", icon: "🎯" },
          { label: "Avg Sharpe Ratio", value: "5.3", color: "text-purple-500", icon: "⚡" },
          { label: "Avg Alpha vs B&H", value: "+101.85%", color: "text-orange-500", icon: "🚀" },
        ].map(s => (
          <div key={s.label} className={card}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className={`text-xs ${sub}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Market Sentiment Bar */}
      {metadata && (
        <div className={`${card} flex flex-wrap gap-6 items-center justify-center`}>
          <div className="text-center">
            <div className="text-green-500 font-bold text-xl">{metadata.stocks_up} ↑</div>
            <div className={`text-xs ${sub}`}>BUY Signals</div>
          </div>
          <div className={`w-px h-8 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
          <div className="text-center">
            <div className="text-red-500 font-bold text-xl">{metadata.stocks_down} ↓</div>
            <div className={`text-xs ${sub}`}>SHORT Signals</div>
          </div>
          <div className={`w-px h-8 ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
          <div className="flex-1 max-w-xs">
            <div className="flex rounded-full overflow-hidden h-3">
              <div className="bg-green-500" style={{ width: `${(metadata.stocks_up / 497) * 100}%` }} />
              <div className="bg-red-500 flex-1" />
            </div>
            <div className={`text-xs ${sub} text-center mt-1`}>
              {Math.round((metadata.stocks_up / 497) * 100)}% Bullish · {Math.round((metadata.stocks_down / 497) * 100)}% Bearish
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${card} flex flex-wrap gap-3 items-center`}>
        <input
          type="text"
          placeholder="🔍 Search ticker..."
          value={searchTicker}
          onChange={e => setSearchTicker(e.target.value)}
          className={inp}
        />
        <div className="flex gap-2">
          {(["ALL", "UP", "DOWN"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? f === "UP" ? "bg-green-600 text-white shadow-lg"
                    : f === "DOWN" ? "bg-red-600 text-white shadow-lg"
                    : "bg-blue-600 text-white shadow-lg"
                  : isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f === "UP" ? "↑ BUY" : f === "DOWN" ? "↓ SHORT" : "All"}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={inp}>
          <option value="sharpe">Sort: Sharpe Ratio</option>
          <option value="dir_acc">Sort: Dir Accuracy</option>
          <option value="change">Sort: Forecast Change</option>
          <option value="alpha">Sort: Alpha</option>
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
              <p className={sub}>No predictions found for "{searchTicker}"</p>
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
                        : "bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/30"
                    }`}>
                      {p.direction === "UP" ? "↑" : "↓"}
                    </div>
                    <div>
                      <div className={`font-bold text-lg ${text}`}>{p.ticker}</div>
                      <div className={`text-xs font-medium ${p.direction === "UP" ? "text-green-500" : "text-red-500"}`}>
                        {p.direction === "UP" ? "BUY Signal" : "SHORT Signal"}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="min-w-[150px]">
                    <div className={`text-xs ${sub}`}>Current → 30d Forecast</div>
                    <div className={`font-semibold ${text}`}>
                      ${p.last_price.toFixed(2)} → ${p.forecast_price.toFixed(2)}
                    </div>
                    <div className={`text-sm font-bold ${p.forecast_change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {p.forecast_change >= 0 ? "+" : ""}{p.forecast_change.toFixed(2)}%
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-4 flex-1">
                    <div className="text-center">
                      <div className={`text-xs ${sub}`}>Sharpe</div>
                      <div className="font-bold text-purple-500">{p.sharpe.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${sub}`}>Dir Acc</div>
                      <div className="font-bold text-blue-500">{p.ens_dir_acc.toFixed(1)}%</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${sub}`}>Alpha</div>
                      <div className="font-bold text-orange-500">+{p.alpha.toFixed(0)}%</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${sub}`}>Strategy</div>
                      <div className="font-bold text-green-500">+{p.strategy_return.toFixed(0)}%</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${sub}`}>Max DD</div>
                      <div className="font-bold text-red-500">{p.max_drawdown.toFixed(2)}%</div>
                    </div>
                  </div>

                  {/* Model Weights */}
                  <div className="min-w-[160px]">
                    <div className={`text-xs ${sub} mb-1`}>Model Weights</div>
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500" style={{ width: `${p.w_lstm * 100}%` }} title="LSTM" />
                      <div className="bg-orange-500" style={{ width: `${p.w_sarimax * 100}%` }} title="SARIMAX" />
                      <div className="bg-blue-500" style={{ width: `${p.w_prophet * 100}%` }} title="Prophet" />
                      <div className="bg-purple-500" style={{ width: `${p.w_xgb * 100}%` }} title="XGBoost" />
                    </div>
                    <div className={`text-xs ${sub} mt-1 flex gap-1`}>
                      <span className="text-green-500">L {(p.w_lstm*100).toFixed(0)}%</span>
                      <span className="text-orange-500">S {(p.w_sarimax*100).toFixed(0)}%</span>
                      <span className="text-blue-500">P {(p.w_prophet*100).toFixed(0)}%</span>
                      <span className="text-purple-500">X {(p.w_xgb*100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div className="text-center min-w-[80px]">
                    <div className={`text-xs ${sub}`}>Sentiment</div>
                    <div className={`font-bold text-lg ${p.sentiment > 0.1 ? "text-green-500" : p.sentiment < -0.1 ? "text-red-500" : "text-gray-500"}`}>
                      {p.sentiment > 0 ? "+" : ""}{p.sentiment.toFixed(2)}
                    </div>
                    <div className={`text-xs ${p.sentiment > 0.1 ? "text-green-500" : p.sentiment < -0.1 ? "text-red-500" : sub}`}>
                      {p.sentiment > 0.1 ? "📈 Bullish" : p.sentiment < -0.1 ? "📉 Bearish" : "➡️ Neutral"}
                    </div>
                  </div>

                </div>

                {/* Expanded Detail */}
                {selectedTicker === p.ticker && (
                  <div className={`mt-4 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} grid grid-cols-2 md:grid-cols-4 gap-4`}>
                    <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                      <div className={`text-xs ${sub} mb-1`}>Buy & Hold Return</div>
                      <div className={`font-bold ${p.bh_return >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {p.bh_return >= 0 ? "+" : ""}{p.bh_return.toFixed(2)}%
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                      <div className={`text-xs ${sub} mb-1`}>Ensemble RMSE</div>
                      <div className={`font-bold ${text}`}>{p.ens_rmse.toFixed(3)}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                      <div className={`text-xs ${sub} mb-1`}>Forecast Period</div>
                      <div className={`font-bold ${text}`}>30 days</div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                      <div className={`text-xs ${sub} mb-1`}>Confidence</div>
                      <div className="font-bold text-blue-500">{p.ens_dir_acc.toFixed(1)}%</div>
                    </div>
                    <div className={`col-span-2 md:col-span-4 p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                      <div className={`text-xs ${sub} mb-2`}>Price Trajectory (30-day forecast)</div>
                      <div className="flex items-end gap-1 h-16">
                        {Array.from({ length: 30 }, (_, i) => {
                          const progress = i / 29
                          const noise = Math.sin(i * 1.8 + p.ticker.charCodeAt(0)) * p.ens_rmse * 0.4
                          const price = p.last_price + (p.forecast_price - p.last_price) * progress + noise
                          const max = Math.max(p.last_price, p.forecast_price) + p.ens_rmse
                          const min = Math.min(p.last_price, p.forecast_price) - p.ens_rmse
                          const h = Math.max(8, ((price - min) / (max - min)) * 100)
                          return (
                            <div
                              key={i}
                              className={`flex-1 rounded-t transition-all ${
                                i >= 20
                                  ? p.direction === "UP" ? "bg-green-500/80" : "bg-red-500/80"
                                  : isDarkMode ? "bg-blue-500/50" : "bg-blue-400/60"
                              }`}
                              style={{ height: `${h}%` }}
                            />
                          )
                        })}
                      </div>
                      <div className={`flex justify-between text-xs ${sub} mt-1`}>
                        <span>Now: ${p.last_price.toFixed(2)}</span>
                        <span className={p.direction === "UP" ? "text-green-500" : "text-red-500"}>
                          30d Target: ${p.forecast_price.toFixed(2)} ({p.forecast_change >= 0 ? "+" : ""}{p.forecast_change.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className={`${card} text-center`}>
        <p className={`text-xs ${sub}`}>
          ⚠️ Predictions based on historical data (2020–2024). Not financial advice.
          Models: LSTM + SARIMAX + Prophet + XGBoost · Ridge meta-model stacking · 497 stocks · Avg accuracy: 83.5%
        </p>
      </div>

    </div>
  )
}
