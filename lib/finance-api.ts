const EUROPEAN_ENERGY_COMPANIES = [
  // Oil & Gas
  { ticker: 'SHEL.L', name: 'Shell plc', country: 'UK/NL', sector: 'Oil & Gas', exchange: 'LSE' },
  { ticker: 'BP.L', name: 'BP plc', country: 'UK', sector: 'Oil & Gas', exchange: 'LSE' },
  { ticker: 'TTE.PA', name: 'TotalEnergies', country: 'France', sector: 'Oil & Gas', exchange: 'Euronext Paris' },
  { ticker: 'EQNR.OL', name: 'Equinor ASA', country: 'Norway', sector: 'Oil & Gas', exchange: 'Oslo' },
  { ticker: 'OMV.VI', name: 'OMV AG', country: 'Austria', sector: 'Oil & Gas', exchange: 'Vienna' },
  
  // Utilities & Power
  { ticker: 'ENEL.MI', name: 'Enel SpA', country: 'Italy', sector: 'Utilities', exchange: 'Milan' },
  { ticker: 'IBE.MC', name: 'Iberdrola SA', country: 'Spain', sector: 'Utilities', exchange: 'Madrid' },
  { ticker: 'EOAN.DE', name: 'E.ON SE', country: 'Germany', sector: 'Utilities', exchange: 'XETRA' },
  { ticker: 'RWE.DE', name: 'RWE AG', country: 'Germany', sector: 'Utilities', exchange: 'XETRA' },
  { ticker: 'ENGI.PA', name: 'Engie SA', country: 'France', sector: 'Utilities', exchange: 'Euronext Paris' },
  { ticker: 'NG.L', name: 'National Grid plc', country: 'UK', sector: 'Utilities', exchange: 'LSE' },
  { ticker: 'ORSTED.CO', name: 'Ørsted A/S', country: 'Denmark', sector: 'Renewables', exchange: 'Copenhagen' },
  { ticker: 'SSE.L', name: 'SSE plc', country: 'UK', sector: 'Utilities', exchange: 'LSE' },
  { ticker: 'EDP.LS', name: 'EDP - Energias de Portugal', country: 'Portugal', sector: 'Utilities', exchange: 'Lisbon' },
  { ticker: 'FORTUM.HE', name: 'Fortum Oyj', country: 'Finland', sector: 'Utilities', exchange: 'Helsinki' }
];


function isEuropeanTicker(ticker: string): boolean {
  const europeanSuffixes = ['.L', '.PA', '.DE', '.MI', '.MC', '.VI', '.OL', '.CO', '.LS', '.HE', '.AS', '.SW'];
  return europeanSuffixes.some(suffix => ticker.endsWith(suffix));
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
  const kazakhSuffixes = ['.KZ', '.KASE'];
  const kazakhTickers = ['KCEL', 'KCMG', 'KZTK', 'BTAS', 'RDGZ', 'KEGC', 'HALYK', 'KAZM', 'KAZN', 'KAZA'];
  
  return kazakhSuffixes.some(suffix => ticker.toUpperCase().endsWith(suffix)) ||
         kazakhTickers.includes(ticker.toUpperCase());
}

export async function getCompanyData(ticker: string): Promise<CompanyData | null> {
  try {
    console.log(`[v0] Fetching data for ${ticker}`)
    
    // Try Yahoo Finance API first
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned ${response.status}`)
    }
    
    const data = await response.json()
    const result = data.chart?.result?.[0]
    
    if (!result) {
      throw new Error('No data returned from Yahoo Finance')
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
      currency: meta.currency || 'USD',
      week52High: meta.fiftyTwoWeekHigh,
      week52Low: meta.fiftyTwoWeekLow,
    }
    
    console.log(`[v0] Successfully fetched ${ticker}:`, companyData)
    return companyData
    
  } catch (error) {
    console.error(`[v0] Error fetching ${ticker}:`, error)
    return null
  }
}
