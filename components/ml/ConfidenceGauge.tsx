"use client"

import { useMemo } from "react"

interface ConfidenceGaugeProps {
  confidence: number
  direction: "UP" | "DOWN" | "SIDEWAYS"
  riskLevel: "low" | "medium" | "high"
  reasoning?: string
  keyFactors?: string[]
}

export default function ConfidenceGauge({
  confidence,
  direction,
  riskLevel,
  reasoning,
  keyFactors
}: ConfidenceGaugeProps) {
  const gaugeData = useMemo(() => {
    // Calculate the rotation angle for the gauge needle (-90 to 90 degrees)
    const angle = (confidence / 100) * 180 - 90
    
    // Determine color based on confidence
    let color = "#f59e0b" // Medium (amber)
    if (confidence >= 70) {
      color = "#10b981" // High (green)
    } else if (confidence < 40) {
      color = "#ef4444" // Low (red)
    }
    
    return { angle, color }
  }, [confidence])

  const riskColors = {
    low: { bg: "bg-emerald-500/20", text: "text-emerald-500", label: "Low Risk" },
    medium: { bg: "bg-amber-500/20", text: "text-amber-500", label: "Medium Risk" },
    high: { bg: "bg-red-500/20", text: "text-red-500", label: "High Risk" }
  }

  const directionColors = {
    UP: { bg: "bg-emerald-500/20", text: "text-emerald-500", icon: "↑", label: "Bullish" },
    DOWN: { bg: "bg-red-500/20", text: "text-red-500", icon: "↓", label: "Bearish" },
    SIDEWAYS: { bg: "bg-slate-500/20", text: "text-slate-400", icon: "→", label: "Neutral" }
  }

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4">Prediction Confidence</h3>
      
      {/* Gauge visualization */}
      <div className="relative w-48 h-28 mx-auto mb-4">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="16"
            strokeLinecap="round"
          />
          
          {/* Colored segments */}
          <path
            d="M 20 100 A 80 80 0 0 1 60 35"
            fill="none"
            stroke="#ef4444"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 60 35 A 80 80 0 0 1 140 35"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 140 35 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#10b981"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.6"
          />
          
          {/* Needle */}
          <g transform={`rotate(${gaugeData.angle}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke={gaugeData.color}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle
              cx="100"
              cy="100"
              r="8"
              fill={gaugeData.color}
            />
          </g>
          
          {/* Center point */}
          <circle
            cx="100"
            cy="100"
            r="5"
            fill="hsl(var(--foreground))"
          />
          
          {/* Labels */}
          <text x="25" y="108" fill="hsl(var(--muted-foreground))" fontSize="10">0</text>
          <text x="95" y="20" fill="hsl(var(--muted-foreground))" fontSize="10">50</text>
          <text x="170" y="108" fill="hsl(var(--muted-foreground))" fontSize="10">100</text>
        </svg>
        
        {/* Confidence value */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <div className="text-3xl font-bold text-foreground">{confidence}%</div>
        </div>
      </div>
      
      {/* Direction and Risk badges */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={`px-3 py-1.5 rounded-lg ${directionColors[direction].bg}`}>
          <span className={`text-lg ${directionColors[direction].text}`}>
            {directionColors[direction].icon}
          </span>
          <span className={`text-sm font-medium ml-1 ${directionColors[direction].text}`}>
            {directionColors[direction].label}
          </span>
        </div>
        <div className={`px-3 py-1.5 rounded-lg ${riskColors[riskLevel].bg}`}>
          <span className={`text-sm font-medium ${riskColors[riskLevel].text}`}>
            {riskColors[riskLevel].label}
          </span>
        </div>
      </div>
      
      {/* Reasoning */}
      {reasoning && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-2">Analysis</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {reasoning}
          </p>
        </div>
      )}
      
      {/* Key Factors */}
      {keyFactors && keyFactors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-2">Key Factors</h4>
          <div className="flex flex-wrap gap-2">
            {keyFactors.map((factor, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
