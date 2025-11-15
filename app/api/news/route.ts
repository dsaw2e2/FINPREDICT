import { type NextRequest, NextResponse } from "next/server"
import yahooFinance from "yahoo-finance2"

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
  predicted_price?: number
  confidence?: number
  models?: {
    sarimax: number
    prophet: number
    lstm: number
  }
}

// 🔑 ДЕТЕРМИНИРОВАННЫЙ ГЕНЕРАТОР СЛУЧАЙНЫХ ЧИСЕЛ
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
  return 450
}

// ✅ МОК-ГЕНЕРАЦИЯ (для fallback)
const generateDeterministicPriceSeries = (
  basePriceUSD: number,
  isKazakh: boolean,
  seed: number,
  length = 252,
): number[] => {
  const rand = seededRandom(seed)
  const dailyVolatility = isKazakh ? 0.025 : 0.015
  const drift = (rand() - 0.5) * 0.0002

  const prices = [basePriceUSD]

  // Дивидендные дни (для KZ)
  const dividendDays = isKazakh ? [60, 120, 180] : []

  for (let i = 1; i < length; i++) {
    const weekday = i % 5 // 0=Пн, 1=Вт, ..., 4=Пт

    let dailyDrift = drift
    let dailyVol = dailyVolatility

    if (weekday === 0) {
      // Понедельник
      dailyDrift -= 0.001
      dailyVol *= 1.3
    } else if (weekday === 4) {
      // Пятница
      dailyVol *= 1.2
    } else if (weekday === 2) {
      // Среда
      dailyVol *= 0.85
    }

    let dividendDrop = 0
    if (dividendDays.includes(i)) {
      const dividendYield = 0.02 + rand() * 0.03 // 2%–5%
      dividendDrop = dividendYield
    }

    const shock = (rand() - 0.5) * 2 * dailyVol
    let newPrice = prices[i - 1] * (1 + dailyDrift + shock)

    if (dividendDrop > 0) {
      newPrice *= 1 - dividendDrop
    }

    newPrice = Math.max(0.1, newPrice)
    prices.push(newPrice)
  }

  return prices
}

// ✅ Получение реальных данных через Yahoo Finance
const getRealHistoricalData = async (ticker: string, isKazakh: boolean): Promise<number[]> => {
  try {
    const yfTicker = isKazakh ? `${ticker}.KZ` : ticker

    const historical = await yahooFinance.historical(yfTicker, {
      period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      period2: new Date(),
      interval: "1d",
    })

    const prices = historical.filter((d) => d.adjclose && d.adjclose > 0).map((d) => d.adjclose)

    if (prices.length < 30) throw new Error("Not enough data")

    return prices
  } catch (e) {
    console.warn(`Yahoo failed for ${ticker}, falling back to mock`)
    const tickerHash = ticker.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return generateDeterministicPriceSeries(100, isKazakh, tickerHash)
  }
}

const getMockData = (ticker: string, tickerHash: number): YahooFinanceData => {
  const isKazakh = isKazakhTicker(ticker)
  const exchangeRate = isKazakh ? getUSDToKZTRate() : 1

  let basePriceUSD: number
  if (isKazakh) {
    basePriceUSD = 50 + (Math.abs(tickerHash) % 200)
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

  const variation = 0.95 + (Math.abs(tickerHash) % 100) / 1000
  const dailyChange = ((Math.abs(tickerHash) % 200) - 100) / 1000

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

// =============== МОДЕЛИ (эвристики, но детерминированы) ===============
const calculateSARIMAX = (data: number[]): number => {
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
  const trendPrediction = slope * n + intercept
  const lastValue = data[data.length - 1]
  const secondLastValue = data[data.length - 2]
  const ar1 = lastValue + 0.3 * (lastValue - secondLastValue)
  return 0.6 * trendPrediction + 0.4 * ar1
}

const calculateProphet = (data: number[]): number => {
  if (data.length < 7) return data[data.length - 1]
  const recentData = data.slice(-30)
  const trend =
    recentData.reduce((sum, val, i) => {
      if (i === 0) return 0
      return sum + (val - recentData[i - 1])
    }, 0) / (recentData.length - 1 || 1)
  const weeklyPattern = data.length >= 7 ? (data[data.length - 1] + data[data.length - 8]) / 2 : data[data.length - 1]
  return weeklyPattern + trend
}

const calculateLSTM = (data: number[]): number => {
  if (data.length < 10) return data[data.length - 1]
  const shortTerm = data.slice(-5).reduce((a, b) => a + b, 0) / 5
  const mediumTerm = data.slice(-Math.min(20, data.length)).reduce((a, b) => a + b, 0) / Math.min(20, data.length)
  const longTerm = data.slice(-Math.min(50, data.length)).reduce((a, b) => a + b, 0) / Math.min(50, data.length)
  return 0.5 * shortTerm + 0.3 * mediumTerm + 0.2 * longTerm
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

const generateImprovedPrediction = async (ticker: string, historicalData: number[]): Promise<any> => {
  const sarimaxPrediction = calculateSARIMAX(historicalData)
  const prophetPrediction = calculateProphet(historicalData)
  const lstmPrediction = calculateLSTM(historicalData)
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

export async function GET(request: NextRequest, context?: { params?: { ticker?: string } }) {
  try {
    if (!context?.params?.ticker) {
      return NextResponse.json({ error: "Ticker is required" }, { status: 400 })
    }

    const ticker = context.params.ticker.toUpperCase()

    // 🔑 Вычисляем hash
    const tickerHash = ticker.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    const isKazakh = isKazakhTicker(ticker)

    // 1. Получаем базовые данные
    const mockData = getMockData(ticker, tickerHash)

    // 2. Получаем исторические данные (реальные или мок)
    let historicalData: number[]
    try {
      historicalData = await getRealHistoricalData(ticker, isKazakh)
    } catch (e) {
      console.error("Failed to fetch real data:", e)
      const basePriceUSD = mockData.price / (isKazakh ? getUSDToKZTRate() : 1)
      historicalData = generateDeterministicPriceSeries(basePriceUSD, isKazakh, tickerHash)
    }

    // 3. Прогноз
    const prediction = await generateImprovedPrediction(ticker, historicalData)

    // 4. Ответ
    return NextResponse.json({
      ...mockData,
      predicted_price: prediction.predicted_price,
      confidence: prediction.confidence,
      models: prediction.models,
    })
  } catch (error) {
    console.error("Error in prediction:", error)
    if (!context?.params?.ticker) {
      return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
    }
    const ticker = context.params.ticker.toUpperCase()
    const tickerHash = ticker.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    return NextResponse.json(getMockData(ticker, tickerHash))
  }
}
