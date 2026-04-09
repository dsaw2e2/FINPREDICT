"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, BarChart3, Loader2, AlertCircle } from "lucide-react"

interface ForecastData {
  historical: { date: string; rate: number }[]
  forecast: { date: string; rate: number; predicted: number; lower: number; upper: number; prophet?: number; xgboost?: number }[]
  currentRate: number
  modelInfo: {
    trend: string
    avgRate: number
    lastRate: number
    oilImpact: string
    oilCorrelation: number
    volatility: number
    forecastChange: number
    forecastChangePercent: number
    rsi?: number
    momentum?: number
    sma7?: number
    sma30?: number
    brentPrice?: number
  }
  reasoning: string[]
  metadata: {
    generatedAt: string
    forecastDays: number
    model: string
    dataSource?: string
  }
}

export default function USDKZTPage() {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forecastDays, setForecastDays] = useState(7)

  const loadForecast = async (days: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/kzt-usd-forecast?days=${days}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Не удалось загрузить прогноз")
      }

      setForecastData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForecast(forecastDays)
  }, [])

  const handleForecastDaysChange = (days: number) => {
    setForecastDays(days)
    loadForecast(days)
  }

  // Объединяем исторические и прогнозные данные для графика
  const chartData = forecastData
    ? [
        ...forecastData.historical.map((d) => ({
          date: d.date,
          actual: d.rate,
          forecast: null,
          lower: null,
          upper: null,
        })),
        ...forecastData.forecast.map((d) => ({
          date: d.date,
          actual: null,
          forecast: d.rate,
          lower: d.lower,
          upper: d.upper,
        })),
      ]
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Прогноз курса USD/KZT
          </h1>
          <p className="text-slate-400">
            Прогнозирование курса доллара США к казахстанскому тенге с учетом цены нефти Brent
          </p>
        </div>

        {/* Current Rate Card */}
        {forecastData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-3">
                <CardDescription>Текущий курс</CardDescription>
                <CardTitle className="text-3xl">{forecastData.currentRate.toFixed(2)} ₸</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-3">
                <CardDescription>Прогноз на {forecastDays} дней</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  {forecastData.forecast[forecastData.forecast.length - 1]?.rate?.toFixed(2) || forecastData.currentRate.toFixed(2)} ₸
                  {forecastData.modelInfo.forecastChange > 0 ? (
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-green-400" />
                  )}
                </CardTitle>
                <p
                  className={`text-sm ${forecastData.modelInfo.forecastChange > 0 ? "text-red-400" : "text-green-400"}`}
                >
                  {forecastData.modelInfo.forecastChange > 0 ? "+" : ""}
                  {forecastData.modelInfo.forecastChangePercent?.toFixed(2) || "0.00"}%
                </p>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-3">
                <CardDescription>Волатильность</CardDescription>
                <CardTitle className="text-3xl">{forecastData.modelInfo.volatility?.toFixed(2) || "0.00"} ₸</CardTitle>
                <p className="text-sm text-slate-400">
                  {forecastData.modelInfo.volatility ? ((forecastData.modelInfo.volatility / forecastData.currentRate) * 100).toFixed(2) : "0.00"}% от курса
                </p>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Forecast Days Selector */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle>Период прогноза</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {[3, 7, 14, 30].map((days) => (
                <Button
                  key={days}
                  variant={forecastDays === days ? "default" : "outline"}
                  onClick={() => handleForecastDaysChange(days)}
                  disabled={loading}
                >
                  {days} дней
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="flex items-center gap-2 py-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Forecast Chart */}
        {!loading && forecastData && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>График прогноза USD/KZT</CardTitle>
              <CardDescription>Исторические данные и прогноз с доверительными интервалами</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    name="Верхняя граница"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    name="Нижняя граница"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="Фактический курс"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Прогноз"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Reasoning Section */}
        {!loading && forecastData && forecastData.reasoning && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Обоснование прогноза
              </CardTitle>
              <CardDescription>Детальный анализ факторов, влияющих на курс USD/KZT</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecastData.reasoning.map((reason, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-slate-300 leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Model Info */}
        {!loading && forecastData && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Информация о модели</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Модель:</span>
                  <span className="ml-2 text-white">{forecastData.metadata.model}</span>
                </div>
                <div>
                  <span className="text-slate-400">Источник данных:</span>
                  <span className="ml-2 text-white">{forecastData.metadata.dataSource || "Yahoo Finance"}</span>
                </div>
                <div>
                  <span className="text-slate-400">Корреляция с нефтью:</span>
                  <span className="ml-2 text-white">{forecastData.modelInfo.oilCorrelation?.toFixed(2) || "-0.52"}</span>
                </div>
                {forecastData.modelInfo.brentPrice && (
                  <div>
                    <span className="text-slate-400">Цена Brent:</span>
                    <span className="ml-2 text-white">${forecastData.modelInfo.brentPrice.toFixed(2)}/баррель</span>
                  </div>
                )}
                {forecastData.modelInfo.rsi && (
                  <div>
                    <span className="text-slate-400">RSI (14):</span>
                    <span className="ml-2 text-white">{forecastData.modelInfo.rsi.toFixed(1)}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Обновлено:</span>
                  <span className="ml-2 text-white">
                    {new Date(forecastData.metadata.generatedAt).toLocaleString("ru-RU")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
