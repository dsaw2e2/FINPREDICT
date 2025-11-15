import { type NextRequest, NextResponse } from "next/server"

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

const isKazakhTicker = (ticker: string): boolean => {
  const kazakhTickers = [
    "KCEL",
    "KCMG",
    "KZTK",
    "BTAS",
    "KASE",
    "RDGZ",
    "CCBN",
    "HSBK",
    "KEGC",
    "ASBN",
    "KKMF",
    "KZTC",
    "KZMS",
    "KZAP",
    "KZTO",
    "KZOK",
    "KZRE",
    "KZPK",
    "KZTR",
    "KZGD",
    "AMGZ",
    "ATFB",
    "EPKZ",
    "HALYK",
    "NFBN",
    "TEBN",
    "TSBN",
    "URKZ",
    "VITA",
    "ZERD",
  ]
  return (
    kazakhTickers.includes(ticker.toUpperCase()) ||
    ticker.includes(".KZ") ||
    ticker.includes(".KASE") ||
    ticker.endsWith("KZ")
  )
}

const getUSDToKZTRate = (): number => {
  return 450 // фиксировано для детерминированности
}

// ✅ ИСПРАВЛЕНО: теперь детерминирован по seed
const generateDeterministicPriceSeries = (
  currentPrice: number,
  isKazakh: boolean,
  seed: number,
  length = 252,
): number[] => {
  const rand = seededRandom(seed)
  const dailyVolatility = isKazakh ? 0.025 : 0.015

  // Generate historical path that ends at current price
  const prices: number[] = []
  let price = currentPrice

  // Work backwards from current price
  for (let i = 0; i < length; i++) {
    const shock = (rand() - 0.5) * 2 * dailyVolatility
    price = price / (1 + shock) // Reverse the growth
    prices.unshift(Math.max(0.1, price))
  }

  // Adjust last price to match current price exactly
  prices.push(currentPrice)

  return prices
}

// ✅ ИСПРАВЛЕНО: теперь принимает tickerHash для детерминированности
const getMockData = (ticker: string, tickerHash: number): YahooFinanceData => {
  const isKazakh = isKazakhTicker(ticker)
  const exchangeRate = isKazakh ? getUSDToKZTRate() : 1

  let basePriceUSD: number
  if (isKazakh) {
    basePriceUSD = 50 + (Math.abs(tickerHash) % 200) // $50–$250
  } else {
    switch (ticker) {
      case "AAPL":
        basePriceUSD = 175
        break
      case "GOOGL":
        basePriceUSD = 140
        break
      case "TSLA":
        basePriceUSD = 250
        break
      case "MSFT":
        basePriceUSD = 350
        break
      default:
        basePriceUSD = 100 + (Math.abs(tickerHash) % 300)
    }
  }

  // Все ниже — детерминированы через tickerHash
  const variation = 0.95 + (Math.abs(tickerHash) % 100) / 1000 // ±5%
  const dailyChange = ((Math.abs(tickerHash) % 200) - 100) / 1000 // -10% to +10%

  const currentPrice = basePriceUSD * variation * exchangeRate
  const changeAmount = basePriceUSD * dailyChange * exchangeRate

  return {
    price: currentPrice,
    change: changeAmount,
    changePercent: dailyChange * 100,
    volume: Math.floor(1000000 + (Math.abs(tickerHash) % 50000000)),
    marketCap: currentPrice * (isKazakh ? 10_000_000 : 1_000_000_000),
    peRatio: 10 + (Math.abs(tickerHash) % 25),
    week52Low: basePriceUSD * 0.8 * exchangeRate,
    week52High: basePriceUSD * 1.2 * exchangeRate,
    name: getCompanyName(ticker, isKazakh),
    currency: isKazakh ? "KZT" : "USD",
  }
}

const getCompanyName = (ticker: string, isKazakh: boolean): string => {
  if (isKazakh) {
    const kazakhNames: { [key: string]: string } = {
      KCEL: "Казахстанская Медная Компания",
      KCMG: "Казахстан Кагазы",
      KZTK: "КазТрансОйл",
      BTAS: "БТА Банк",
      KASE: "Казахстанская Фондовая Биржа",
      RDGZ: "РД КМГ",
      CCBN: "Центр Кредит Банк",
      HSBK: "Халык Банк",
      KEGC: "KEGOC",
      ASBN: "Астана-Финанс",
    }
    return kazakhNames[ticker] || `${ticker} АО`
  } else {
    const usNames: { [key: string]: string } = {
      AAPL: "Apple Inc.",
      GOOGL: "Alphabet Inc.",
      TSLA: "Tesla Inc.",
      MSFT: "Microsoft Corporation",
    }
    return usNames[ticker] || `${ticker} Corporation`
  }
}

// =============== МОДЕЛИ (уже детерминированы — не используют Math.random()) ===============

const calculateSARIMAX = (data: number[], daysAhead = 1): number => {
  if (data.length < 5) return data[data.length - 1]
  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = data
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Predict forward by daysAhead
  const futurePrediction = slope * (n + daysAhead - 1) + intercept

  const lastValue = data[data.length - 1]
  const secondLastValue = data[data.length - 2]
  const ar1Component = lastValue + 0.3 * (lastValue - secondLastValue) * daysAhead

  return 0.6 * futurePrediction + 0.4 * ar1Component
}

const calculateProphet = (data: number[], daysAhead = 1): number => {
  if (data.length < 7) return data[data.length - 1]
  const recentData = data.slice(-30)

  // Calculate trend from recent data
  const trend =
    recentData.reduce((sum, val, i) => {
      if (i === 0) return 0
      return sum + (val - recentData[i - 1])
    }, 0) / (recentData.length - 1 || 1)

  const weeklyPattern = data.length >= 7 ? (data[data.length - 1] + data[data.length - 8]) / 2 : data[data.length - 1]

  // Project trend forward
  return weeklyPattern + trend * daysAhead
}

const calculateLSTM = (data: number[], daysAhead = 1): number => {
  if (data.length < 10) return data[data.length - 1]

  const shortTerm = data.slice(-5).reduce((a, b) => a + b, 0) / 5
  const mediumTerm = data.slice(-Math.min(20, data.length)).reduce((a, b) => a + b, 0) / Math.min(20, data.length)
  const longTerm = data.slice(-Math.min(50, data.length)).reduce((a, b) => a + b, 0) / Math.min(50, data.length)

  // Calculate momentum
  const currentPrice = data[data.length - 1]
  const momentum = (currentPrice - longTerm) / longTerm

  // Weighted average with momentum projection
  const basePredict = 0.5 * shortTerm + 0.3 * mediumTerm + 0.2 * longTerm

  // Apply momentum for future days
  return basePredict * (1 + momentum * 0.1 * daysAhead)
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
): Promise<any> => {
  const sarimaxPrediction = calculateSARIMAX(historicalData, daysAhead)
  const prophetPrediction = calculateProphet(historicalData, daysAhead)
  const lstmPrediction = calculateLSTM(historicalData, daysAhead)
  const ensemblePrediction = (sarimaxPrediction + prophetPrediction + lstmPrediction) / 3

  return {
    predicted_price: Math.round(ensemblePrediction * 100) / 100,
    confidence: calculateConfidence(historicalData),
    models: {
      sarimax: Math.round(sarimaxPrediction * 100) / 100,
      prophet: Math.round(prophetPrediction * 100) / 100,
      lstm: Math.round(lstmPrediction * 100) / 100,
    },
  }
}

// =============== ОСНОВНОЙ ЭНДПОИНТ ===============

export const dynamic = "force-dynamic"

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
      const tickerHash = ticker.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)

      const isKazakh = isKazakhTicker(ticker)
      const mockData = getMockData(ticker, tickerHash)

      const historicalData = generateDeterministicPriceSeries(mockData.price, isKazakh, tickerHash)

      const prediction = await generateImprovedPrediction(ticker, historicalData, period)

      results.push({
        ticker,
        ...mockData,
        predicted_price: prediction.predicted_price,
        confidence: prediction.confidence,
        models: prediction.models,
      })
    }

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error("Error in prediction:", error)
    return NextResponse.json({ error: "Failed to process tickers" }, { status: 500 })
  }
}
