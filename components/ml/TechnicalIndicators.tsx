"use client"

interface TechnicalIndicatorsProps {
  rsi: number | null
  macd: number | null
  macdSignal: number | null
  sma20: number | null
  sma50: number | null
  bollingerUpper: number | null
  bollingerLower: number | null
  atr: number | null
  volatility: number | null
  momentum: number | null
  volumeRatio: number | null
  position52w: number | null
  currentPrice: number
}

export default function TechnicalIndicators({
  rsi,
  macd,
  macdSignal,
  sma20,
  sma50,
  bollingerUpper,
  bollingerLower,
  atr,
  volatility,
  momentum,
  volumeRatio,
  position52w,
  currentPrice
}: TechnicalIndicatorsProps) {
  // RSI interpretation
  const getRSISignal = (value: number | null) => {
    if (value === null) return { label: "N/A", color: "text-muted-foreground" }
    if (value > 70) return { label: "Overbought", color: "text-red-500" }
    if (value < 30) return { label: "Oversold", color: "text-emerald-500" }
    return { label: "Neutral", color: "text-amber-500" }
  }

  // MACD interpretation
  const getMACDSignal = (macd: number | null, signal: number | null) => {
    if (macd === null || signal === null) return { label: "N/A", color: "text-muted-foreground" }
    if (macd > signal && macd > 0) return { label: "Bullish", color: "text-emerald-500" }
    if (macd < signal && macd < 0) return { label: "Bearish", color: "text-red-500" }
    return { label: "Mixed", color: "text-amber-500" }
  }

  // SMA crossover
  const getSMACross = (sma20: number | null, sma50: number | null, price: number) => {
    if (sma20 === null || sma50 === null) return { label: "N/A", color: "text-muted-foreground" }
    if (price > sma20 && sma20 > sma50) return { label: "Golden", color: "text-emerald-500" }
    if (price < sma20 && sma20 < sma50) return { label: "Death", color: "text-red-500" }
    return { label: "Mixed", color: "text-amber-500" }
  }

  // Volatility interpretation
  const getVolatilityLabel = (vol: number | null) => {
    if (vol === null) return { label: "N/A", color: "text-muted-foreground" }
    if (vol < 15) return { label: "Low", color: "text-emerald-500" }
    if (vol > 30) return { label: "High", color: "text-red-500" }
    return { label: "Medium", color: "text-amber-500" }
  }

  const indicators = [
    {
      name: "RSI (14)",
      value: rsi?.toFixed(1) ?? "N/A",
      signal: getRSISignal(rsi),
      description: "Relative Strength Index"
    },
    {
      name: "MACD",
      value: macd?.toFixed(3) ?? "N/A",
      signal: getMACDSignal(macd, macdSignal),
      description: "Moving Average Convergence Divergence"
    },
    {
      name: "SMA Cross",
      value: `${sma20?.toFixed(0) ?? "N/A"} / ${sma50?.toFixed(0) ?? "N/A"}`,
      signal: getSMACross(sma20, sma50, currentPrice),
      description: "20/50 SMA Crossover"
    },
    {
      name: "Volatility",
      value: volatility ? `${volatility.toFixed(1)}%` : "N/A",
      signal: getVolatilityLabel(volatility),
      description: "Annualized volatility"
    }
  ]

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <h3 className="text-lg font-semibold text-foreground mb-1">Technical Indicators</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Key signals from technical analysis
      </p>
      
      {/* Main indicators grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {indicators.map((indicator) => (
          <div 
            key={indicator.name}
            className="p-3 rounded-lg bg-secondary/50"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{indicator.name}</span>
              <span className={`text-xs font-medium ${indicator.signal.color}`}>
                {indicator.signal.label}
              </span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {indicator.value}
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional metrics */}
      <div className="space-y-3 pt-4 border-t border-border">
        {/* Bollinger Band position */}
        {bollingerUpper !== null && bollingerLower !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Bollinger Band Position</span>
              <span className="text-foreground">
                ${bollingerLower.toFixed(0)} - ${bollingerUpper.toFixed(0)}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden relative">
              <div className="absolute inset-0 flex">
                <div className="w-1/4 bg-red-500/30" />
                <div className="w-1/4 bg-amber-500/30" />
                <div className="w-1/4 bg-amber-500/30" />
                <div className="w-1/4 bg-red-500/30" />
              </div>
              <div 
                className="absolute w-2 h-2 bg-primary rounded-full top-0 -translate-x-1/2 transition-all"
                style={{ 
                  left: `${Math.min(100, Math.max(0, ((currentPrice - bollingerLower) / (bollingerUpper - bollingerLower)) * 100))}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
              <span>Lower Band</span>
              <span>Upper Band</span>
            </div>
          </div>
        )}
        
        {/* 52-week position */}
        {position52w !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">52-Week Range Position</span>
              <span className="text-foreground">{position52w.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all"
                style={{ width: `${position52w}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
              <span>52w Low</span>
              <span>52w High</span>
            </div>
          </div>
        )}
        
        {/* Additional stats row */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">ATR</div>
            <div className="text-sm font-medium text-foreground">
              {atr ? `$${atr.toFixed(2)}` : "N/A"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Momentum</div>
            <div className={`text-sm font-medium ${momentum !== null && momentum >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {momentum !== null ? `${momentum >= 0 ? "+" : ""}${momentum.toFixed(1)}%` : "N/A"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Vol Ratio</div>
            <div className={`text-sm font-medium ${volumeRatio !== null && volumeRatio > 1.2 ? "text-amber-500" : "text-foreground"}`}>
              {volumeRatio?.toFixed(2) ?? "N/A"}x
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
