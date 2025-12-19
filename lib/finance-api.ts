const EUROPEAN_ENERGY_COMPANIES = [
  // Oil & Gas
  { ticker: "SHEL.L", name: "Shell plc", country: "UK/NL", sector: "Oil & Gas", exchange: "LSE" },
  { ticker: "BP.L", name: "BP plc", country: "UK", sector: "Oil & Gas", exchange: "LSE" },
  { ticker: "TTE.PA", name: "TotalEnergies", country: "France", sector: "Oil & Gas", exchange: "Euronext Paris" },
  { ticker: "EQNR.OL", name: "Equinor ASA", country: "Norway", sector: "Oil & Gas", exchange: "Oslo" },
  { ticker: "OMV.VI", name: "OMV AG", country: "Austria", sector: "Oil & Gas", exchange: "Vienna" },

  // Utilities & Power
  { ticker: "ENEL.MI", name: "Enel SpA", country: "Italy", sector: "Utilities", exchange: "Milan" },
  { ticker: "IBE.MC", name: "Iberdrola SA", country: "Spain", sector: "Utilities", exchange: "Madrid" },
  { ticker: "EOAN.DE", name: "E.ON SE", country: "Germany", sector: "Utilities", exchange: "XETRA" },
  { ticker: "RWE.DE", name: "RWE AG", country: "Germany", sector: "Utilities", exchange: "XETRA" },
  { ticker: "ENGI.PA", name: "Engie SA", country: "France", sector: "Utilities", exchange: "Euronext Paris" },
  { ticker: "NG.L", name: "National Grid plc", country: "UK", sector: "Utilities", exchange: "LSE" },
  { ticker: "ORSTED.CO", name: "Ørsted A/S", country: "Denmark", sector: "Renewables", exchange: "Copenhagen" },
  { ticker: "SSE.L", name: "SSE plc", country: "UK", sector: "Utilities", exchange: "LSE" },
  {
    ticker: "EDP.LS",
    name: "EDP - Energias de Portugal",
    country: "Portugal",
    sector: "Utilities",
    exchange: "Lisbon",
  },
  { ticker: "FORTUM.HE", name: "Fortum Oyj", country: "Finland", sector: "Utilities", exchange: "Helsinki" },
]

const REQUEST_DELAY = 600 // 600ms delay between requests to avoid rate limits
const MAX_RETRIES = 3
const CACHE_TTL = 300000 // 5 minutes in milliseconds

// Simple in-memory cache
const cache = new Map<string, { data: CompanyData | null; timestamp: number }>()

// Rate limiting queue
let lastRequestTime = 0

async function rateLimitedFetch(url: string, retries = 0): Promise<Response> {
  // Implement rate limiting
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 300 },
    })

    if (response.status === 429 && retries < MAX_RETRIES) {
      const backoffTime = Math.pow(2, retries + 2) * 1000 // Exponential backoff: 4s, 8s, 16s
      console.log(`[v0] Rate limited, retrying in ${backoffTime}ms (attempt ${retries + 1}/${MAX_RETRIES})`)
      await new Promise((resolve) => setTimeout(resolve, backoffTime))
      return rateLimitedFetch(url, retries + 1)
    }

    return response
  } catch (error) {
    if (retries < MAX_RETRIES) {
      const backoffTime = Math.pow(2, retries + 1) * 1000 // 2s, 4s, 8s
      console.log(`[v0] Request failed, retrying in ${backoffTime}ms`)
      await new Promise((resolve) => setTimeout(resolve, backoffTime))
      return rateLimitedFetch(url, retries + 1)
    }
    throw error
  }
}

export interface CompanyData {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  currency: string
  week52High?: number
  week52Low?: number
  peRatio?: number
}

export function isKazakhTicker(ticker: string): boolean {
  const kazakhSuffixes = [".KZ", ".KASE"]
  const kazakhTickers = ["KCEL", "KCMG", "KZTK", "BTAS", "RDGZ", "KEGC", "HALYK", "KAZM", "KAZN", "KAZA"]

  return (
    kazakhSuffixes.some((suffix) => ticker.toUpperCase().endsWith(suffix)) ||
    kazakhTickers.includes(ticker.toUpperCase())
  )
}

export async function getCompanyData(ticker: string): Promise<CompanyData | null> {
  try {
    const cached = cache.get(ticker)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[v0] Using cached data for ${ticker}`)
      return cached.data
    }

    console.log(`[v0] Fetching data for ${ticker}`)

    // Try Yahoo Finance API with rate limiting
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`
    const response = await rateLimitedFetch(yahooUrl)

    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned ${response.status}`)
    }

    const data = await response.json()
    const result = data.chart?.result?.[0]

    if (!result) {
      throw new Error("No data returned from Yahoo Finance")
    }

    const meta = result.meta
    const quote = result.indicators?.quote?.[0]

    const price = meta.regularMarketPrice || meta.previousClose || 0
    const previousClose = meta.chartPreviousClose || meta.previousClose || price
    const change = price - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

    const companyData: CompanyData = {
      ticker: ticker,
      name: meta.longName || meta.shortName || ticker,
      price: price,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || quote?.volume?.[quote.volume.length - 1] || 0,
      marketCap: meta.marketCap,
      currency: meta.currency || "USD",
      week52High: meta.fiftyTwoWeekHigh,
      week52Low: meta.fiftyTwoWeekLow,
    }

    cache.set(ticker, { data: companyData, timestamp: Date.now() })

    console.log(`[v0] Successfully fetched ${ticker}:`, companyData)
    return companyData
  } catch (error) {
    console.error(`[v0] Error fetching ${ticker}:`, error)

    const cached = cache.get(ticker)
    if (cached?.data) {
      console.log(`[v0] Using expired cached data for ${ticker}`)
      return cached.data
    }

    return null
  }
}
