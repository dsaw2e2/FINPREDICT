"use client"

import { useMemo } from "react"
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from "recharts"

interface EnsembleChartProps {
  currentPrice: number
  forecastPrice: number
  priceRangeLow: number
  priceRangeHigh: number
  predSarimax: number | null
  predProphet: number | null
  predXgboost: number | null
  timeframe: "1d" | "1w" | "1m"
  ticker: string
}

export default function EnsembleChart({
  currentPrice,
  forecastPrice,
  priceRangeLow,
  priceRangeHigh,
  predSarimax,
  predProphet,
  predXgboost,
  timeframe,
  ticker
}: EnsembleChartProps) {
  const data = useMemo(() => {
    const days = timeframe === "1d" ? 1 : timeframe === "1w" ? 5 : 21
    const points = []
    
    // Historical point (current)
    points.push({
      day: 0,
      label: "Now",
      price: currentPrice,
      ensemble: currentPrice,
      sarimax: currentPrice,
      prophet: currentPrice,
      xgboost: currentPrice,
      rangeHigh: currentPrice,
      rangeLow: currentPrice
    })
    
    // Forecast points (interpolated)
    const midpoint = Math.floor(days / 2)
    if (days > 1) {
      // Midpoint
      const midEnsemble = currentPrice + (forecastPrice - currentPrice) * 0.5
      const midSarimax = predSarimax ? currentPrice + (predSarimax - currentPrice) * 0.5 : null
      const midProphet = predProphet ? currentPrice + (predProphet - currentPrice) * 0.5 : null
      const midXgboost = predXgboost ? currentPrice + (predXgboost - currentPrice) * 0.5 : null
      const midRangeHigh = currentPrice + (priceRangeHigh - currentPrice) * 0.4
      const midRangeLow = currentPrice + (priceRangeLow - currentPrice) * 0.4
      
      points.push({
        day: midpoint,
        label: `Day ${midpoint}`,
        ensemble: midEnsemble,
        sarimax: midSarimax,
        prophet: midProphet,
        xgboost: midXgboost,
        rangeHigh: midRangeHigh,
        rangeLow: midRangeLow
      })
    }
    
    // Final forecast point
    points.push({
      day: days,
      label: timeframe === "1d" ? "Tomorrow" : timeframe === "1w" ? "1 Week" : "1 Month",
      ensemble: forecastPrice,
      sarimax: predSarimax,
      prophet: predProphet,
      xgboost: predXgboost,
      rangeHigh: priceRangeHigh,
      rangeLow: priceRangeLow
    })
    
    return points
  }, [currentPrice, forecastPrice, priceRangeLow, priceRangeHigh, predSarimax, predProphet, predXgboost, timeframe])

  const priceChange = ((forecastPrice - currentPrice) / currentPrice) * 100
  const isPositive = priceChange >= 0

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{ticker} Ensemble Forecast</h3>
          <p className="text-sm text-muted-foreground">
            {timeframe === "1d" ? "1-Day" : timeframe === "1w" ? "1-Week" : "1-Month"} prediction
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            ${forecastPrice.toFixed(2)}
          </div>
          <div className={`text-sm ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}{priceChange.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#888", fontSize: 11 }}
            />
            <YAxis 
              domain={["dataMin - 5", "dataMax + 5"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))"
              }}
              formatter={(value: number, name: string) => [
                `$${value?.toFixed(2) || "N/A"}`,
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
            />
            
            {/* Confidence range area */}
            <Area
              type="monotone"
              dataKey="rangeHigh"
              stroke="none"
              fill="url(#rangeGradient)"
              name="Range High"
            />
            <Area
              type="monotone"
              dataKey="rangeLow"
              stroke="none"
              fill="hsl(var(--card))"
              name="Range Low"
            />
            
            {/* Current price reference */}
            <ReferenceLine 
              y={currentPrice} 
              stroke="#666" 
              strokeDasharray="3 3"
              label={{ value: "Current", fill: "#888", fontSize: 10 }}
            />
            
            {/* Individual model predictions */}
            {predSarimax && (
              <Line
                type="monotone"
                dataKey="sarimax"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="SARIMAX"
              />
            )}
            {predProphet && (
              <Line
                type="monotone"
                dataKey="prophet"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Prophet"
              />
            )}
            {predXgboost && (
              <Line
                type="monotone"
                dataKey="xgboost"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="XGBoost"
              />
            )}
            
            {/* Ensemble prediction (main line) */}
            <Line
              type="monotone"
              dataKey="ensemble"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={3}
              dot={{ fill: isPositive ? "#10b981" : "#ef4444", r: 4 }}
              name="Ensemble"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="p-2 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground">Low</div>
          <div className="text-sm font-medium text-foreground">${priceRangeLow.toFixed(2)}</div>
        </div>
        <div className={`p-2 rounded-lg ${isPositive ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
          <div className="text-xs text-muted-foreground">Target</div>
          <div className={`text-sm font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            ${forecastPrice.toFixed(2)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground">High</div>
          <div className="text-sm font-medium text-foreground">${priceRangeHigh.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
