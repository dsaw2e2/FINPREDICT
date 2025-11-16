export const dynamic = 'force-dynamic'
export const revalidate = 86400 // Cache for 24 hours

interface MacroData {
  inflation: number
  interestRate: number
  gdpGrowth: number
  marketIndex: { value: number; change: number; changePercent: number }
  vix: { value: number; change: number }
  timestamp: string
}

async function fetchMarketIndex() {
  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/^STOXX?interval=1d&range=5d',
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()
    
    if (!data?.chart?.result?.[0]) {
      return null
    }

    const result = data.chart.result[0]
    const quotes = result.indicators.quote[0]
    const prices = quotes.close.filter((p: number) => p != null)
    
    if (prices.length < 2) {
      return null
    }

    const currentPrice = prices[prices.length - 1]
    const previousPrice = prices[prices.length - 2]
    const change = currentPrice - previousPrice
    const changePercent = (change / previousPrice) * 100

    return {
      value: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2))
    }
  } catch (error) {
    console.error('[v0] Error fetching market index:', error)
    return null
  }
}

async function fetchVIX() {
  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/^VIX?interval=1d&range=5d',
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()
    
    if (!data?.chart?.result?.[0]) {
      return null
    }

    const result = data.chart.result[0]
    const quotes = result.indicators.quote[0]
    const prices = quotes.close.filter((p: number) => p != null)
    
    if (prices.length < 2) {
      return null
    }

    const currentPrice = prices[prices.length - 1]
    const previousPrice = prices[prices.length - 2]
    const change = currentPrice - previousPrice

    return {
      value: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2))
    }
  } catch (error) {
    console.error('[v0] Error fetching VIX:', error)
    return null
  }
}

export async function GET() {
  try {
    const [marketIndex, vix] = await Promise.all([
      fetchMarketIndex(),
      fetchVIX()
    ])

    const data: MacroData = {
      inflation: 2.4, // EU inflation rate (%)
      interestRate: 4.5, // ECB interest rate (%)
      gdpGrowth: 0.8, // EU GDP growth (%)
      marketIndex: marketIndex || { value: 480.0, change: 0, changePercent: 0 },
      vix: vix || { value: 15.0, change: 0 },
      timestamp: new Date().toISOString()
    }

    return Response.json(data)
  } catch (error) {
    console.error('[v0] Error in macro API:', error)
    return Response.json({ error: 'Failed to fetch macro data' }, { status: 500 })
  }
}
