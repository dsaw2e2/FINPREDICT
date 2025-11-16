export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

interface OilGasData {
  brent: { price: number; change: number; changePercent: number }
  wti: { price: number; change: number; changePercent: number }
  ttfGas: { price: number; change: number; changePercent: number }
  carbon: { price: number; change: number; changePercent: number }
  timestamp: string
}

async function fetchCommodityPrice(ticker: string) {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`,
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()
    
    if (!data?.chart?.result?.[0]) {
      throw new Error(`No data for ${ticker}`)
    }

    const result = data.chart.result[0]
    const quotes = result.indicators.quote[0]
    const prices = quotes.close.filter((p: number) => p != null)
    
    if (prices.length < 2) {
      throw new Error(`Insufficient price data for ${ticker}`)
    }

    const currentPrice = prices[prices.length - 1]
    const previousPrice = prices[prices.length - 2]
    const change = currentPrice - previousPrice
    const changePercent = (change / previousPrice) * 100

    return {
      price: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2))
    }
  } catch (error) {
    console.error(`[v0] Error fetching ${ticker}:`, error)
    return null
  }
}

export async function GET() {
  try {
    const [brent, wti, ttfGas, carbon] = await Promise.all([
      fetchCommodityPrice('BZ=F'),  // Brent Oil
      fetchCommodityPrice('CL=F'),  // WTI Oil
      fetchCommodityPrice('TTF=F'), // TTF Natural Gas
      fetchCommodityPrice('ECF=F')  // EU Carbon Allowances
    ])

    const data: OilGasData = {
      brent: brent || { price: 75.0, change: 0, changePercent: 0 },
      wti: wti || { price: 70.0, change: 0, changePercent: 0 },
      ttfGas: ttfGas || { price: 45.0, change: 0, changePercent: 0 },
      carbon: carbon || { price: 80.0, change: 0, changePercent: 0 },
      timestamp: new Date().toISOString()
    }

    return Response.json(data)
  } catch (error) {
    console.error('[v0] Error in oil-gas API:', error)
    return Response.json({ error: 'Failed to fetch oil and gas prices' }, { status: 500 })
  }
}
