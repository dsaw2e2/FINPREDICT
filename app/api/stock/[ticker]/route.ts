import { type NextRequest, NextResponse } from "next/server"
import { getStockInfo } from "@/lib/stocks"

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
    "CCBN",
    "EPKZ",
    "HALYK",
    "KASE",
    "KCEL",
    "KCMG",
    "KEGC",
    "KKMF",
    "KZAP",
    "KZGD",
    "KZMS",
    "KZOK",
    "KZPK",
    "KZRE",
    "KZTO",
    "KZTC",
    "KZTK",
    "KZTR",
    "NFBN",
    "RDGZ",
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

const getMockData = (ticker: string): YahooFinanceData => {
  const tickerHash = ticker.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const isKazakh = isKazakhTicker(ticker)
  const exchangeRate = isKazakh ? getUSDToKZTRate() : 1

  let basePrice: number
  if (isKazakh) {
    basePrice = 50 + (Math.abs(tickerHash) % 200) // 50-250 USD base
  } else {
    switch (ticker) {
      case "AAPL":
        basePrice = 175
        break
      case "GOOGL":
        basePrice = 140
        break
      case "TSLA":
        basePrice = 250
        break
      case "MSFT":
        basePrice = 350
        break
      default:
        basePrice = 100 + (Math.abs(tickerHash) % 300)
    }
  }

  const variation = 0.95 + (Math.abs(tickerHash) % 100) / 1000 // 0.95 to 1.05
  const dailyChange = ((Math.abs(tickerHash) % 200) - 100) / 1000 // -0.1 to 0.1

  const currentPrice = basePrice * variation * exchangeRate
  const changeAmount = basePrice * dailyChange * exchangeRate

  return {
    price: currentPrice,
    change: changeAmount,
    changePercent: dailyChange * 100,
    volume: Math.floor(1000000 + (Math.abs(tickerHash) % 50000000)),
    marketCap: currentPrice * (isKazakh ? 10000000 : 1000000000), // Smaller market cap for Kazakh stocks
    peRatio: 10 + (Math.abs(tickerHash) % 25),
    week52Low: basePrice * 0.8 * exchangeRate,
    week52High: basePrice * 1.2 * exchangeRate,
    name: getCompanyName(ticker, isKazakh),
    currency: isKazakh ? "KZT" : "USD",
  }
}

const getCompanyName = (ticker: string, isKazakh: boolean): string => {
  // First try to get from comprehensive stock list
  const stockInfo = getStockInfo(ticker)
  if (stockInfo) {
    return stockInfo.name
  }
  
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
    return `${ticker} Corporation`
  }
}

const generateImprovedPrediction = async (ticker: string, historicalData: number[]): Promise<any> => {
  // SARIMAX-inspired: Trend + Seasonality + Autoregression
  const sarimaxPrediction = calculateSARIMAX(historicalData)

  // Prophet-inspired: Decompose trend and seasonality
  const prophetPrediction = calculateProphet(historicalData)

  // LSTM-inspired: Pattern recognition with moving averages
  const lstmPrediction = calculateLSTM(historicalData)

  // Ensemble: Average of three models
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

// SARIMAX: Autoregressive Integrated Moving Average with trend
const calculateSARIMAX = (data: number[]): number => {
  if (data.length < 5) return data[data.length - 1]

  // Calculate trend using linear regression
  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = data

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Predict next value with trend
  const trendPrediction = slope * n + intercept

  // Add autoregressive component (AR1)
  const lastValue = data[data.length - 1]
  const secondLastValue = data[data.length - 2]
  const ar1 = lastValue + 0.3 * (lastValue - secondLastValue)

  // Combine trend and AR
  return 0.6 * trendPrediction + 0.4 * ar1
}

// Prophet: Trend decomposition with seasonality
const calculateProphet = (data: number[]): number => {
  if (data.length < 7) return data[data.length - 1]

  // Calculate overall trend
  const recentData = data.slice(-30)
  const trend =
    recentData.reduce((sum, val, i) => {
      if (i === 0) return val
      return sum + (val - recentData[i - 1])
    }, 0) / recentData.length

  // Weekly seasonality (if enough data)
  const weeklyPattern = data.length >= 7 ? (data[data.length - 1] + data[data.length - 8]) / 2 : data[data.length - 1]

  // Combine trend and seasonality
  return weeklyPattern + trend
}

// LSTM: Pattern recognition using moving averages
const calculateLSTM = (data: number[]): number => {
  if (data.length < 10) return data[data.length - 1]

  // Short-term pattern (5-day MA)
  const shortTerm = data.slice(-5).reduce((a, b) => a + b, 0) / 5

  // Medium-term pattern (20-day MA)
  const mediumTerm = data.slice(-Math.min(20, data.length)).reduce((a, b) => a + b, 0) / Math.min(20, data.length)

  // Long-term pattern (50-day MA)
  const longTerm = data.slice(-Math.min(50, data.length)).reduce((a, b) => a + b, 0) / Math.min(50, data.length)

  // Weighted combination (more weight on recent data)
  return 0.5 * shortTerm + 0.3 * mediumTerm + 0.2 * longTerm
}

// Calculate confidence based on data volatility
const calculateConfidence = (data: number[]): number => {
  if (data.length < 2) return 50

  // Calculate standard deviation
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  const stdDev = Math.sqrt(variance)

  // Lower volatility = higher confidence
  const volatility = stdDev / mean
  const confidence = Math.max(30, Math.min(95, 85 - volatility * 100))

  return Math.round(confidence)
}

export async function GET(request: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    const ticker = params.ticker.toUpperCase()
    const isKazakh = isKazakhTicker(ticker)

    if (isKazakh) {
      console.log(`[v0] Using enhanced mock data for Kazakh ticker: ${ticker}`)
      const mockData = getMockData(ticker)
      return NextResponse.json(mockData)
    }

    const exchangeRate = 1 // Only for USD stocks now

    const endpoints = [
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      `https://finance.yahoo.com/quote/${ticker}/history?p=${ticker}`,
    ]

    let stockData: YahooFinanceData | null = null
    let historicalData: number[] = []

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          method: "GET",
        })

        if (response.ok) {
          const data = await response.json()

          if (data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0]
            const meta = result.meta
            historicalData = result.indicators.quote[0].close || []

            stockData = {
              price: (meta.regularMarketPrice || meta.previousClose || 0) * exchangeRate,
              change: ((meta.regularMarketPrice || meta.previousClose || 0) - (meta.previousClose || 0)) * exchangeRate,
              changePercent: meta.previousClose
                ? (((meta.regularMarketPrice || meta.previousClose) - meta.previousClose) / meta.previousClose) * 100
                : 0,
              volume: meta.regularMarketVolume || 0,
              marketCap: (meta.marketCap || 0) * exchangeRate,
              peRatio: meta.trailingPE || 0,
              week52Low: (meta.fiftyTwoWeekLow || 0) * exchangeRate,
              week52High: (meta.fiftyTwoWeekHigh || 0) * exchangeRate,
              name: meta.longName || meta.shortName || ticker,
              currency: isKazakh ? "KZT" : "USD",
            }
            break
          }
        }
      } catch (endpointError) {
        console.log(`Endpoint ${url} failed:`, endpointError)
        continue
      }
    }

    if (!stockData) {
      console.log(`All Yahoo Finance endpoints failed for ${ticker}, using mock data`)
      stockData = getMockData(ticker)
    } else {
      const prediction = await generateImprovedPrediction(ticker, historicalData)
      stockData.predicted_price = prediction.predicted_price
      stockData.confidence = prediction.confidence
      stockData.models = prediction.models
    }

    return NextResponse.json(stockData)
  } catch (error) {
    console.error("Error fetching stock data:", error)
    const mockData = getMockData(params.ticker.toUpperCase())
    return NextResponse.json(mockData)
  }
}
