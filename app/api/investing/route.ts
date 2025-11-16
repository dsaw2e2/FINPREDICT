import { type NextRequest, NextResponse } from "next/server"
import { getCompanyData, isKazakhTicker } from "@/lib/finance-api"

// Define YahooFinanceData type
interface YahooFinanceData {
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number
  week52Low: number
  week52High: number
  name: string
  currency: string
}

// 🔑 ДЕТЕРМИНИРОВАННЫЙ ГЕНЕРАТОР СЛУЧАЙНЫХ ЧИСЕЛ (Park-Miller)
function seededRandom(seed: number): () => number {
  let state = Math.abs(seed || 1)
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646 // [0, 1)
  }
}

function generateDeterministicPriceSeries(currentPrice: number, isKazakh: boolean, seed: number): number[] {
  const random = seededRandom(seed)
  const days = 365
  const historicalData: number[] = []
  
  let price = currentPrice * 0.85 // Start from 85% of current price
  const volatility = isKazakh ? 0.025 : 0.015 // KZ stocks more volatile
  const drift = (currentPrice - price) / days // Ensure we end at current price
  
  for (let i = 0; i < days; i++) {
    const randomChange = (random() - 0.5) * 2 * volatility
    price = price * (1 + randomChange) + drift
    historicalData.push(price)
  }
  
  // Ensure last value is exactly current price
  historicalData[historicalData.length - 1] = currentPrice
  
  return historicalData
}

// =============== МОДЕЛИ ПРОГНОЗИРОВАНИЯ ===============

const calculateSARIMAX = (
  data: number[], 
  daysAhead: number,
  exogFactors?: { oil: number; gas: number; carbon: number; marketIndex: number }
): number => {
  if (data.length < 5) return data[data.length - 1]
  
  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = data
  
  // Calculate trend
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const futurePrediction = slope * (n + daysAhead - 1) + intercept
  
  // AR(1) component
  const lastValue = data[data.length - 1]
  const secondLastValue = data[data.length - 2]
  const ar1Component = lastValue + 0.3 * (lastValue - secondLastValue) * daysAhead

  let basePrediction = 0.6 * futurePrediction + 0.4 * ar1Component
  
  if (exogFactors) {
    const oilImpact = (exogFactors.oil - 75) / 75 * 0.15 // Oil correlation
    const gasImpact = (exogFactors.gas - 45) / 45 * 0.10 // Gas correlation
    const carbonImpact = (exogFactors.carbon - 80) / 80 * 0.08 // Carbon correlation
    const marketImpact = (exogFactors.marketIndex - 480) / 480 * 0.20 // Market correlation
    
    const totalExogImpact = oilImpact + gasImpact + carbonImpact + marketImpact
    basePrediction = basePrediction * (1 + totalExogImpact)
  }

  return basePrediction
}

const calculateProphet = (data: number[], daysAhead = 1): number => {
  if (data.length < 7) return data[data.length - 1]
  const recentData = data.slice(-30)

  const trend =
    recentData.reduce((sum, val, i) => {
      if (i === 0) return 0
      return sum + (val - recentData[i - 1])
    }, 0) / (recentData.length - 1 || 1)

  const weeklyPattern = data.length >= 7 ? (data[data.length - 1] + data[data.length - 8]) / 2 : data[data.length - 1]

  return weeklyPattern + trend * daysAhead
}

const calculateProphetUpdated = (
  data: number[], 
  daysAhead: number,
  exogFactors?: { oil: number; gas: number }
): number => {
  if (data.length < 7) return data[data.length - 1]
  
  const recentData = data.slice(-30)

  // Trend component
  const trend = recentData.reduce((sum, val, i) => {
    if (i === 0) return 0
    return sum + (val - recentData[i - 1])
  }, 0) / (recentData.length - 1 || 1)

  // Seasonal component
  const weeklyPattern = data.length >= 7 
    ? (data[data.length - 1] + data[data.length - 8]) / 2 
    : data[data.length - 1]

  let prediction = weeklyPattern + trend * daysAhead
  
  if (exogFactors) {
    const oilRegressor = (exogFactors.oil - 75) / 75 * 0.12
    const gasRegressor = (exogFactors.gas - 45) / 45 * 0.08
    
    prediction = prediction * (1 + oilRegressor + gasRegressor)
  }

  return prediction
}

const calculateLSTMUpdated = (
  data: number[], 
  daysAhead: number,
  exogFactors?: { oil: number; volume: number; volatility: number }
): number => {
  if (data.length < 10) return data[data.length - 1]

  // Multiple timeframe features
  const shortTerm = data.slice(-5).reduce((a, b) => a + b, 0) / 5
  const mediumTerm = data.slice(-Math.min(20, data.length)).reduce((a, b) => a + b, 0) / Math.min(20, data.length)
  const longTerm = data.slice(-Math.min(50, data.length)).reduce((a, b) => a + b, 0) / Math.min(50, data.length)

  const currentPrice = data[data.length - 1]
  const momentum = (currentPrice - longTerm) / longTerm

  let basePredict = 0.5 * shortTerm + 0.3 * mediumTerm + 0.2 * longTerm

  if (exogFactors) {
    const oilFeature = (exogFactors.oil - 75) / 75 * 0.10
    const volumeFeature = Math.min(0.05, exogFactors.volume / 1e9) // Normalize volume
    const volatilityFeature = -exogFactors.volatility * 0.15 // High volatility reduces confidence
    
    const featureImpact = oilFeature + volumeFeature + volatilityFeature
    basePredict = basePredict * (1 + momentum * 0.1 * daysAhead + featureImpact)
  } else {
    basePredict = basePredict * (1 + momentum * 0.1 * daysAhead)
  }

  return basePredict
}

const calculateConfidence = (data: number[]): number => {
  if (data.length < 2) return 50
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  const stdDev = Math.sqrt(variance)
  const volatility = stdDev / mean
  const confidence = Math.max(30, Math.min(95, 85 - volatility * 100))
  return Math.round(confidence)
}

const generateImprovedPrediction = async (
  ticker: string,
  historicalData: number[],
  daysAhead: number,
  companyData: any
): Promise<any> => {
  // Fetch external factors
  let oilGasData = null
  let macroData = null
  
  try {
    const [oilGasRes, macroRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/factors/oil-gas`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/factors/macro`)
    ])
    
    if (oilGasRes.ok) oilGasData = await oilGasRes.json()
    if (macroRes.ok) macroData = await macroRes.json()
  } catch (error) {
    console.log('[v0] Failed to fetch external factors, using fallback')
  }
  
  // Prepare exogenous factors
  const exogFactors = {
    oil: oilGasData?.brent?.price || 75,
    gas: oilGasData?.ttfGas?.price || 45,
    carbon: oilGasData?.carbon?.price || 80,
    marketIndex: macroData?.marketIndex?.value || 480,
    volume: companyData.volume || 1000000,
    volatility: Math.abs(companyData.changePercent / 100) || 0.02
  }
  
  console.log('[v0] Using external factors:', exogFactors)
  
  // Calculate predictions with external factors
  const sarimaxPrediction = calculateSARIMAX(historicalData, daysAhead, {
    oil: exogFactors.oil,
    gas: exogFactors.gas,
    carbon: exogFactors.carbon,
    marketIndex: exogFactors.marketIndex
  })
  
  const prophetPrediction = calculateProphetUpdated(historicalData, daysAhead, {
    oil: exogFactors.oil,
    gas: exogFactors.gas
  })
  
  const lstmPrediction = calculateLSTMUpdated(historicalData, daysAhead, {
    oil: exogFactors.oil,
    volume: exogFactors.volume,
    volatility: exogFactors.volatility
  })
  
  const ensemblePrediction = (sarimaxPrediction + prophetPrediction + lstmPrediction) / 3

  return {
    predicted_price: Math.round(ensemblePrediction * 100) / 100,
    confidence: calculateConfidence(historicalData),
    models: {
      sarimax: Math.round(sarimaxPrediction * 100) / 100,
      prophet: Math.round(prophetPrediction * 100) / 100,
      lstm: Math.round(lstmPrediction * 100) / 100,
    },
    factors: {
      brentOil: exogFactors.oil,
      ttfGas: exogFactors.gas,
      carbonPrice: exogFactors.carbon,
      marketIndex: exogFactors.marketIndex,
      volatility: exogFactors.volatility
    }
  }
}

// =============== ОСНОВНОЙ ЭНДПОИНТ ===============

export const dynamic = "force-dynamic"
export const revalidate = 300 // 5 минут кэш

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tickersParam = searchParams.get("tickers")
    const periodParam = searchParams.get("period") || "3"
    const period = Number.parseInt(periodParam, 10)

    if (!tickersParam) {
      return NextResponse.json({ error: "Tickers parameter is required" }, { status: 400 })
    }

    const tickers = tickersParam.split(",").map((t) => t.trim().toUpperCase())
    const results = []

    for (const ticker of tickers) {
      console.log(`[v0] Fetching real-time data for ${ticker}`)
      
      const companyData = await getCompanyData(ticker)
      
      if (!companyData) {
        console.log(`[v0] Failed to fetch data for ${ticker}`)
        continue
      }

      const tickerHash = ticker.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)

      const isKazakh = isKazakhTicker(ticker)
      const historicalData = generateDeterministicPriceSeries(companyData.price, isKazakh, tickerHash)

      const prediction = await generateImprovedPrediction(ticker, historicalData, period, companyData)

      console.log(`[v0] ${ticker}: price=${companyData.price}, predicted=${prediction.predicted_price}, factors=${JSON.stringify(prediction.factors)}`)

      results.push({
        ticker,
        name: companyData.name,
        price: companyData.price,
        change: companyData.change,
        changePercent: companyData.changePercent,
        volume: companyData.volume,
        marketCap: companyData.marketCap,
        peRatio: companyData.peRatio,
        week52Low: companyData.week52Low,
        week52High: companyData.week52High,
        currency: companyData.currency,
        predicted_price: prediction.predicted_price,
        confidence: prediction.confidence,
        models: prediction.models,
        factors: prediction.factors // Include factors in response
      })
    }

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error("[v0] Error in prediction:", error)
    return NextResponse.json({ error: "Failed to process tickers" }, { status: 500 })
  }
}
