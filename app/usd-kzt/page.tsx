"use client"

import { useState, useEffect } from "react"
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts"
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, Activity,
  BarChart2, Droplets, Zap, AlertCircle, Info,
} from "lucide-react"

interface ForecastData {
  historical: { date: string; rate: number }[]
  forecast: {
    date: string; rate: number; predicted: number
    lower: number; upper: number; prophet?: number; xgboost?: number
  }[]
  currentRate: number
  modelInfo: {
    trend: string; avgRate: number; lastRate: number
    oilImpact: string; oilCorrelation: number; volatility: number
    forecastChange: number; forecastChangePercent: number
    rsi?: number; momentum?: number; sma7?: number; sma30?: number; brentPrice?: number
  }
  reasoning: string[]
  metadata: { generatedAt: string; forecastDays: number; model: string; dataSource?: string }
}

const DAYS_OPTIONS = [3, 7, 14, 30]

const trendLabel: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  weakening:    { label: "Ослабление тенге",    color: "text-red-400",    icon: <TrendingUp   className="w-4 h-4" /> },
  strengthening:{ label: "Укрепление тенге",    color: "text-emerald-400",icon: <TrendingDown className="w-4 h-4" /> },
  neutral:      { label: "Нейтральный тренд",   color: "text-yellow-400", icon: <Minus        className="w-4 h-4" /> },
}

function getRsiLabel(rsi?: number) {
  if (!rsi) return { label: "—", color: "text-slate-400" }
  if (rsi > 70) return { label: "Перекуплен", color: "text-red-400" }
  if (rsi < 30) return { label: "Перепродан", color: "text-emerald-400" }
  return { label: "Нейтрально", color: "text-yellow-400" }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })
}

// Custom tooltip for chart
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-2 font-medium">{formatDate(label)}</p>
      {payload.map((p: any) => (
        p.value !== null && (
          <div key={p.dataKey} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-300">{p.name}:</span>
            <span className="text-white font-semibold">{Number(p.value).toFixed(2)} ₸</span>
          </div>
        )
      ))}
    </div>
  )
}

export default function USDKZTPage() {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forecastDays, setForecastDays] = useState(7)
  const [activeTab, setActiveTab] = useState<"chart" | "analysis" | "model">("chart")

  const loadForecast = async (days: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/kzt-usd-forecast?days=${days}`)
      const result = await res.json()
      if (!result.success) throw new Error(result.error || "Не удалось загрузить прогноз")
      setForecastData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadForecast(forecastDays) }, [])

  const handleDaysChange = (days: number) => {
    setForecastDays(days)
    loadForecast(days)
  }

  // Merge historical + forecast for main chart (last 30 historical points)
  const chartData = forecastData ? [
    ...forecastData.historical.slice(-30).map(d => ({
      date: d.date, actual: d.rate,
      forecast: null, lower: null, upper: null, prophet: null, xgboost: null,
    })),
    ...forecastData.forecast.map(d => ({
      date: d.date, actual: null,
      forecast: d.rate, lower: d.lower, upper: d.upper,
      prophet: d.prophet ?? null, xgboost: d.xgboost ?? null,
    })),
  ] : []

  const rsiInfo = getRsiLabel(forecastData?.modelInfo.rsi)
  const trendInfo = trendLabel[forecastData?.modelInfo.trend ?? "neutral"]
  const changePositive = (forecastData?.modelInfo.forecastChange ?? 0) > 0

  const lastForecastRate = forecastData?.forecast[forecastData.forecast.length - 1]?.rate
  const allRates = forecastData ? [...forecastData.historical.map(h => h.rate), ...forecastData.forecast.map(f => f.rate)] : []
  const yMin = allRates.length ? Math.floor(Math.min(...allRates) - 3) : 510
  const yMax = allRates.length ? Math.ceil(Math.max(...allRates) + 3) : 540

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">USD / KZT</h1>
              <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary font-medium">LIVE</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Прогноз курса доллара к тенге · Prophet + XGBoost ансамбль
            </p>
          </div>
          <button
            onClick={() => loadForecast(forecastDays)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !forecastData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        )}

        {forecastData && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Current Rate */}
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Текущий курс</p>
                <p className="text-2xl font-bold">{forecastData.currentRate.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">тенге за 1 USD</p>
              </div>

              {/* Forecast */}
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Прогноз ({forecastDays}д)</p>
                <p className="text-2xl font-bold">{lastForecastRate?.toFixed(2) ?? "—"}</p>
                <p className={`text-xs font-medium flex items-center gap-1 ${changePositive ? "text-red-400" : "text-emerald-400"}`}>
                  {changePositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {forecastData.modelInfo.forecastChange > 0 ? "+" : ""}{forecastData.modelInfo.forecastChange.toFixed(2)} ({forecastData.modelInfo.forecastChangePercent.toFixed(2)}%)
                </p>
              </div>

              {/* Volatility */}
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Волатильность (14д)</p>
                <p className="text-2xl font-bold">{forecastData.modelInfo.volatility.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {((forecastData.modelInfo.volatility / forecastData.currentRate) * 100).toFixed(2)}% от курса
                </p>
              </div>

              {/* Brent Oil */}
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Droplets className="w-3 h-3" />Нефть Brent</p>
                <p className="text-2xl font-bold">${forecastData.modelInfo.brentPrice?.toFixed(2) ?? "—"}</p>
                <p className={`text-xs font-medium ${forecastData.modelInfo.oilImpact === "positive" ? "text-emerald-400" : forecastData.modelInfo.oilImpact === "negative" ? "text-red-400" : "text-yellow-400"}`}>
                  {forecastData.modelInfo.oilImpact === "positive" ? "Поддерживает тенге" : forecastData.modelInfo.oilImpact === "negative" ? "Давление на тенге" : "Нейтральное влияние"}
                </p>
              </div>
            </div>

            {/* Days Selector + Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tab nav */}
              <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 w-fit">
                {(["chart", "analysis", "model"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "chart" ? "График" : tab === "analysis" ? "Анализ" : "Модель"}
                  </button>
                ))}
              </div>

              {/* Forecast days */}
              <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 w-fit">
                {DAYS_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => handleDaysChange(d)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      forecastDays === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}д
                  </button>
                ))}
              </div>
            </div>

            {/* CHART TAB */}
            {activeTab === "chart" && (
              <div className="rounded-xl bg-card border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-sm">Исторические данные и прогноз</h2>
                  <span className="text-xs text-muted-foreground">Последние 30 дней + {forecastDays} дней прогноза</span>
                </div>
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.08} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis domain={[yMin, yMax]} tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(0)} width={45} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                    {/* Confidence band */}
                    <Area dataKey="upper" name="Верхняя граница" stroke="none" fill="url(#gradBand)" dot={false} legendType="none" />
                    <Area dataKey="lower" name="Нижняя граница" stroke="none" fill="white" fillOpacity={0} dot={false} legendType="none" />
                    {/* Actual */}
                    <Area dataKey="actual" name="Фактический курс" stroke="#6366f1" strokeWidth={2} fill="url(#gradActual)" dot={false} connectNulls={false} />
                    {/* Forecast */}
                    <Area dataKey="forecast" name="Прогноз (ансамбль)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" fill="url(#gradForecast)" dot={false} connectNulls={false} />
                    {/* Dividing reference line at today */}
                    <ReferenceLine x={new Date().toISOString().split('T')[0]} stroke="#475569" strokeDasharray="4 4" label={{ value: "Сегодня", fill: "#64748b", fontSize: 11 }} />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Model lines chart */}
                <div className="mt-6">
                  <h3 className="text-xs text-muted-foreground font-medium mb-3">Прогноз по отдельным моделям</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={forecastData.forecast} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis domain={["auto", "auto"]} tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(0)} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                      <Line dataKey="predicted" name="Ансамбль" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line dataKey="prophet"   name="Prophet-style" stroke="#34d399" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                      <Line dataKey="xgboost"   name="XGBoost-style" stroke="#f87171" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ANALYSIS TAB */}
            {activeTab === "analysis" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Technical indicators */}
                <div className="rounded-xl bg-card border border-border p-4 space-y-4">
                  <h2 className="font-semibold text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" />Технические индикаторы</h2>
                  <div className="space-y-3">
                    {[
                      { label: "RSI (14)", value: forecastData.modelInfo.rsi?.toFixed(1), extra: rsiInfo.label, extraColor: rsiInfo.color, bar: forecastData.modelInfo.rsi, barMax: 100 },
                      { label: "SMA 7", value: forecastData.modelInfo.sma7?.toFixed(2) + " ₸", bar: null, barMax: null },
                      { label: "SMA 30", value: forecastData.modelInfo.sma30?.toFixed(2) + " ₸", bar: null, barMax: null },
                      { label: "Momentum", value: (forecastData.modelInfo.momentum ?? 0) > 0 ? `+${forecastData.modelInfo.momentum?.toFixed(2)}` : forecastData.modelInfo.momentum?.toFixed(2), bar: null, barMax: null },
                      { label: "Корреляция с нефтью", value: forecastData.modelInfo.oilCorrelation.toFixed(2), bar: Math.abs(forecastData.modelInfo.oilCorrelation), barMax: 1 },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <div className="flex items-center gap-2">
                            {item.extra && <span className={`text-xs ${item.extraColor}`}>{item.extra}</span>}
                            <span className="font-semibold text-foreground">{item.value ?? "—"}</span>
                          </div>
                        </div>
                        {item.bar !== null && item.barMax !== null && (
                          <div className="h-1 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((item.bar / item.barMax) * 100, 100)}%` }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trend & Reasoning */}
                <div className="rounded-xl bg-card border border-border p-4 space-y-4">
                  <h2 className="font-semibold text-sm flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" />Прогноз и выводы</h2>

                  {/* Trend badge */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    trendInfo.color === "text-red-400" ? "bg-red-900/20 border-red-800" :
                    trendInfo.color === "text-emerald-400" ? "bg-emerald-900/20 border-emerald-800" :
                    "bg-yellow-900/20 border-yellow-800"
                  }`}>
                    <span className={trendInfo.color}>{trendInfo.icon}</span>
                    <span className={`text-sm font-medium ${trendInfo.color}`}>{trendInfo.label}</span>
                  </div>

                  {/* Forecast table */}
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Средний курс (90д)", value: forecastData.modelInfo.avgRate.toFixed(2) + " ₸" },
                      { label: "Изменение прогноза", value: `${forecastData.modelInfo.forecastChange > 0 ? "+" : ""}${forecastData.modelInfo.forecastChange.toFixed(2)} ₸ (${forecastData.modelInfo.forecastChangePercent.toFixed(2)}%)` },
                      { label: "Влияние нефти", value: forecastData.modelInfo.oilImpact === "positive" ? "Поддерживающее" : forecastData.modelInfo.oilImpact === "negative" ? "Негативное" : "Нейтральное" },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between py-1.5 border-b border-border/50">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-semibold">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Reasoning */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Info className="w-3 h-3" />Обоснование модели</p>
                    {forecastData.reasoning.map((r, i) => (
                      <p key={i} className="text-xs text-muted-foreground leading-relaxed bg-secondary/40 rounded-lg px-3 py-2">
                        {r}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODEL TAB */}
            {activeTab === "model" && (
              <div className="rounded-xl bg-card border border-border p-4 space-y-5">
                <h2 className="font-semibold text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />Информация о модели</h2>

                {/* Model weights */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Prophet-style", weight: 60, color: "#34d399", desc: "Сезонность, праздники, тренды. Учитывает повторяющиеся паттерны курса." },
                    { name: "XGBoost-style", weight: 40, color: "#f87171", desc: "Технические признаки: RSI, SMA, импульс, корреляция с нефтью." },
                  ].map(m => (
                    <div key={m.name} className="rounded-lg bg-secondary/40 p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{m.name}</span>
                        <span className="text-lg font-bold" style={{ color: m.color }}>{m.weight}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.weight}%`, background: m.color }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  {[
                    { label: "Модель", value: forecastData.metadata.model },
                    { label: "Источник данных", value: forecastData.metadata.dataSource ?? "Yahoo Finance" },
                    { label: "Обновлено", value: new Date(forecastData.metadata.generatedAt).toLocaleString("ru-RU") },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg bg-secondary/40 p-3">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="font-medium text-xs leading-relaxed">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3 border border-border/50">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Прогноз носит информационный характер и не является финансовой рекомендацией. Курс может существенно отклоняться от прогнозных значений под влиянием макроэкономических факторов.</span>
                </div>
              </div>
            )}

            {/* Forecast Table */}
            {activeTab === "chart" && (
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-sm">Таблица прогноза</h2>
                  <span className="text-xs text-muted-foreground">{forecastDays} торговых дней</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Дата", "Прогноз", "Нижняя граница", "Верхняя граница", "Изменение"].map(h => (
                          <th key={h} className="text-left text-xs text-muted-foreground font-medium px-4 py-2.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData.forecast.map((row, i) => {
                        const prev = i === 0 ? forecastData.currentRate : forecastData.forecast[i - 1].rate
                        const delta = row.rate - prev
                        return (
                          <tr key={row.date} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                            <td className="px-4 py-2.5 text-muted-foreground">{new Date(row.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", weekday: "short" })}</td>
                            <td className="px-4 py-2.5 font-semibold">{row.rate.toFixed(2)} ₸</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{row.lower.toFixed(2)} ₸</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{row.upper.toFixed(2)} ₸</td>
                            <td className={`px-4 py-2.5 font-medium text-xs ${delta > 0 ? "text-red-400" : delta < 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                              {delta > 0 ? "+" : ""}{delta.toFixed(2)} ₸
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
