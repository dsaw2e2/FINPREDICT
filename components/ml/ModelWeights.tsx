"use client"

interface ModelWeightsProps {
  wSarimax: number
  wProphet: number
  wXgboost: number
  predSarimax: number | null
  predProphet: number | null
  predXgboost: number | null
  currentPrice: number
}

export default function ModelWeights({
  wSarimax,
  wProphet,
  wXgboost,
  predSarimax,
  predProphet,
  predXgboost,
  currentPrice
}: ModelWeightsProps) {
  const models = [
    {
      name: "SARIMAX",
      description: "Time-series autoregressive model",
      weight: wSarimax,
      prediction: predSarimax,
      color: "#3b82f6",
      bgColor: "bg-blue-500/20"
    },
    {
      name: "Prophet",
      description: "Seasonal decomposition model",
      weight: wProphet,
      prediction: predProphet,
      color: "#8b5cf6",
      bgColor: "bg-violet-500/20"
    },
    {
      name: "XGBoost",
      description: "Gradient boosting with technicals",
      weight: wXgboost,
      prediction: predXgboost,
      color: "#f59e0b",
      bgColor: "bg-amber-500/20"
    }
  ]

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <h3 className="text-lg font-semibold text-foreground mb-1">Model Weights</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Adaptive ensemble allocation based on market regime
      </p>
      
      <div className="space-y-4">
        {models.map((model) => {
          const change = model.prediction 
            ? ((model.prediction - currentPrice) / currentPrice) * 100 
            : null
          const isPositive = change !== null && change >= 0
          
          return (
            <div key={model.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: model.color }}
                  />
                  <div>
                    <span className="text-sm font-medium text-foreground">{model.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                      {model.description}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {model.prediction && (
                    <span className={`text-sm ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                      ${model.prediction.toFixed(2)}
                      <span className="text-xs ml-1">
                        ({isPositive ? "+" : ""}{change?.toFixed(2)}%)
                      </span>
                    </span>
                  )}
                  <span className="text-sm font-semibold text-foreground min-w-[45px] text-right">
                    {(model.weight * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${model.weight * 100}%`,
                    backgroundColor: model.color 
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Weight distribution visualization */}
      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-1 h-6 rounded-lg overflow-hidden">
          <div 
            className="h-full flex items-center justify-center text-xs font-medium text-white transition-all"
            style={{ 
              width: `${wSarimax * 100}%`,
              backgroundColor: "#3b82f6" 
            }}
          >
            {wSarimax >= 0.15 && `${(wSarimax * 100).toFixed(0)}%`}
          </div>
          <div 
            className="h-full flex items-center justify-center text-xs font-medium text-white transition-all"
            style={{ 
              width: `${wProphet * 100}%`,
              backgroundColor: "#8b5cf6" 
            }}
          >
            {wProphet >= 0.15 && `${(wProphet * 100).toFixed(0)}%`}
          </div>
          <div 
            className="h-full flex items-center justify-center text-xs font-medium text-white transition-all"
            style={{ 
              width: `${wXgboost * 100}%`,
              backgroundColor: "#f59e0b" 
            }}
          >
            {wXgboost >= 0.15 && `${(wXgboost * 100).toFixed(0)}%`}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Weights adjust based on volatility regime and trend strength
        </p>
      </div>
    </div>
  )
}
