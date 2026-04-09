/**
 * Comprehensive Stock List Configuration
 * Real stock tickers with accurate company information
 * Data fetched from Yahoo Finance API
 */

export interface StockInfo {
  ticker: string
  name: string
  sector: string
  industry?: string
  exchange?: string
  currency?: string
  country?: string
}

export interface StockCategory {
  name: string
  stocks: StockInfo[]
}

// ============================================
// US STOCKS - Major Sectors
// ============================================

export const US_TECH: StockInfo[] = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", industry: "Consumer Electronics", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "MSFT", name: "Microsoft Corporation", sector: "Technology", industry: "Software", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "GOOGL", name: "Alphabet Inc. (Class A)", sector: "Technology", industry: "Internet Services", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Technology", industry: "E-Commerce", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "NVDA", name: "NVIDIA Corporation", sector: "Technology", industry: "Semiconductors", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "META", name: "Meta Platforms Inc.", sector: "Technology", industry: "Social Media", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "TSLA", name: "Tesla Inc.", sector: "Technology", industry: "Electric Vehicles", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "AVGO", name: "Broadcom Inc.", sector: "Technology", industry: "Semiconductors", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "ORCL", name: "Oracle Corporation", sector: "Technology", industry: "Enterprise Software", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "CRM", name: "Salesforce Inc.", sector: "Technology", industry: "Cloud Computing", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "ADBE", name: "Adobe Inc.", sector: "Technology", industry: "Software", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "CSCO", name: "Cisco Systems Inc.", sector: "Technology", industry: "Networking", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "INTC", name: "Intel Corporation", sector: "Technology", industry: "Semiconductors", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "AMD", name: "Advanced Micro Devices", sector: "Technology", industry: "Semiconductors", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "IBM", name: "International Business Machines", sector: "Technology", industry: "IT Services", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "QCOM", name: "Qualcomm Inc.", sector: "Technology", industry: "Semiconductors", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "TXN", name: "Texas Instruments", sector: "Technology", industry: "Semiconductors", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "NOW", name: "ServiceNow Inc.", sector: "Technology", industry: "Cloud Computing", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "AMAT", name: "Applied Materials", sector: "Technology", industry: "Semiconductor Equipment", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "MU", name: "Micron Technology", sector: "Technology", industry: "Memory Chips", exchange: "NASDAQ", currency: "USD", country: "USA" },
]

export const US_FINANCE: StockInfo[] = [
  { ticker: "JPM", name: "JPMorgan Chase & Co.", sector: "Finance", industry: "Banking", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "BAC", name: "Bank of America Corp.", sector: "Finance", industry: "Banking", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "WFC", name: "Wells Fargo & Company", sector: "Finance", industry: "Banking", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "GS", name: "Goldman Sachs Group", sector: "Finance", industry: "Investment Banking", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "MS", name: "Morgan Stanley", sector: "Finance", industry: "Investment Banking", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "V", name: "Visa Inc.", sector: "Finance", industry: "Payments", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "MA", name: "Mastercard Inc.", sector: "Finance", industry: "Payments", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "AXP", name: "American Express Co.", sector: "Finance", industry: "Credit Services", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "C", name: "Citigroup Inc.", sector: "Finance", industry: "Banking", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "BLK", name: "BlackRock Inc.", sector: "Finance", industry: "Asset Management", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "SCHW", name: "Charles Schwab Corp.", sector: "Finance", industry: "Brokerage", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "USB", name: "U.S. Bancorp", sector: "Finance", industry: "Banking", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "PNC", name: "PNC Financial Services", sector: "Finance", industry: "Banking", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "COF", name: "Capital One Financial", sector: "Finance", industry: "Credit Services", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "PYPL", name: "PayPal Holdings", sector: "Finance", industry: "Digital Payments", exchange: "NASDAQ", currency: "USD", country: "USA" },
]

export const US_HEALTHCARE: StockInfo[] = [
  { ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare", industry: "Health Insurance", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "LLY", name: "Eli Lilly and Co.", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "PFE", name: "Pfizer Inc.", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "ABBV", name: "AbbVie Inc.", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "MRK", name: "Merck & Co.", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "TMO", name: "Thermo Fisher Scientific", sector: "Healthcare", industry: "Life Sciences", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "ABT", name: "Abbott Laboratories", sector: "Healthcare", industry: "Medical Devices", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "DHR", name: "Danaher Corporation", sector: "Healthcare", industry: "Life Sciences", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "BMY", name: "Bristol-Myers Squibb", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "AMGN", name: "Amgen Inc.", sector: "Healthcare", industry: "Biotechnology", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "GILD", name: "Gilead Sciences", sector: "Healthcare", industry: "Biotechnology", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "CVS", name: "CVS Health Corp.", sector: "Healthcare", industry: "Healthcare Services", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "ISRG", name: "Intuitive Surgical", sector: "Healthcare", industry: "Medical Devices", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "VRTX", name: "Vertex Pharmaceuticals", sector: "Healthcare", industry: "Biotechnology", exchange: "NASDAQ", currency: "USD", country: "USA" },
]

export const US_CONSUMER: StockInfo[] = [
  { ticker: "WMT", name: "Walmart Inc.", sector: "Consumer", industry: "Retail", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "PG", name: "Procter & Gamble", sector: "Consumer", industry: "Consumer Goods", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "KO", name: "Coca-Cola Company", sector: "Consumer", industry: "Beverages", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "PEP", name: "PepsiCo Inc.", sector: "Consumer", industry: "Beverages", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "COST", name: "Costco Wholesale", sector: "Consumer", industry: "Retail", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "HD", name: "Home Depot Inc.", sector: "Consumer", industry: "Home Improvement", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "MCD", name: "McDonald's Corp.", sector: "Consumer", industry: "Restaurants", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "NKE", name: "Nike Inc.", sector: "Consumer", industry: "Apparel", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "SBUX", name: "Starbucks Corp.", sector: "Consumer", industry: "Restaurants", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "TGT", name: "Target Corporation", sector: "Consumer", industry: "Retail", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "LOW", name: "Lowe's Companies", sector: "Consumer", industry: "Home Improvement", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "DIS", name: "Walt Disney Co.", sector: "Consumer", industry: "Entertainment", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "NFLX", name: "Netflix Inc.", sector: "Consumer", industry: "Streaming", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "ABNB", name: "Airbnb Inc.", sector: "Consumer", industry: "Travel", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "BKNG", name: "Booking Holdings", sector: "Consumer", industry: "Travel", exchange: "NASDAQ", currency: "USD", country: "USA" },
]

export const US_ENERGY: StockInfo[] = [
  { ticker: "XOM", name: "Exxon Mobil Corp.", sector: "Energy", industry: "Oil & Gas", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "CVX", name: "Chevron Corporation", sector: "Energy", industry: "Oil & Gas", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "COP", name: "ConocoPhillips", sector: "Energy", industry: "Oil & Gas", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "SLB", name: "Schlumberger Ltd.", sector: "Energy", industry: "Oilfield Services", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "EOG", name: "EOG Resources", sector: "Energy", industry: "Oil & Gas", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "MPC", name: "Marathon Petroleum", sector: "Energy", industry: "Refining", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "PSX", name: "Phillips 66", sector: "Energy", industry: "Refining", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "VLO", name: "Valero Energy", sector: "Energy", industry: "Refining", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "OXY", name: "Occidental Petroleum", sector: "Energy", industry: "Oil & Gas", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "HAL", name: "Halliburton Company", sector: "Energy", industry: "Oilfield Services", exchange: "NYSE", currency: "USD", country: "USA" },
]

export const US_INDUSTRIAL: StockInfo[] = [
  { ticker: "CAT", name: "Caterpillar Inc.", sector: "Industrial", industry: "Machinery", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "BA", name: "Boeing Company", sector: "Industrial", industry: "Aerospace", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "HON", name: "Honeywell International", sector: "Industrial", industry: "Conglomerate", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "UPS", name: "United Parcel Service", sector: "Industrial", industry: "Logistics", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "RTX", name: "RTX Corporation", sector: "Industrial", industry: "Defense", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "LMT", name: "Lockheed Martin", sector: "Industrial", industry: "Defense", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "GE", name: "General Electric", sector: "Industrial", industry: "Conglomerate", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "DE", name: "Deere & Company", sector: "Industrial", industry: "Machinery", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "UNP", name: "Union Pacific Corp.", sector: "Industrial", industry: "Railroads", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "FDX", name: "FedEx Corporation", sector: "Industrial", industry: "Logistics", exchange: "NYSE", currency: "USD", country: "USA" },
]

// ============================================
// EUROPEAN STOCKS
// ============================================

export const EUROPEAN_STOCKS: StockInfo[] = [
  // UK
  { ticker: "SHEL.L", name: "Shell plc", sector: "Energy", industry: "Oil & Gas", exchange: "LSE", currency: "GBP", country: "UK" },
  { ticker: "BP.L", name: "BP plc", sector: "Energy", industry: "Oil & Gas", exchange: "LSE", currency: "GBP", country: "UK" },
  { ticker: "HSBA.L", name: "HSBC Holdings", sector: "Finance", industry: "Banking", exchange: "LSE", currency: "GBP", country: "UK" },
  { ticker: "AZN.L", name: "AstraZeneca", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "LSE", currency: "GBP", country: "UK" },
  { ticker: "GSK.L", name: "GSK plc", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "LSE", currency: "GBP", country: "UK" },
  { ticker: "ULVR.L", name: "Unilever plc", sector: "Consumer", industry: "Consumer Goods", exchange: "LSE", currency: "GBP", country: "UK" },
  { ticker: "RIO.L", name: "Rio Tinto", sector: "Materials", industry: "Mining", exchange: "LSE", currency: "GBP", country: "UK" },
  
  // Germany
  { ticker: "SAP.DE", name: "SAP SE", sector: "Technology", industry: "Enterprise Software", exchange: "XETRA", currency: "EUR", country: "Germany" },
  { ticker: "SIE.DE", name: "Siemens AG", sector: "Industrial", industry: "Conglomerate", exchange: "XETRA", currency: "EUR", country: "Germany" },
  { ticker: "ALV.DE", name: "Allianz SE", sector: "Finance", industry: "Insurance", exchange: "XETRA", currency: "EUR", country: "Germany" },
  { ticker: "DTE.DE", name: "Deutsche Telekom", sector: "Telecom", industry: "Telecommunications", exchange: "XETRA", currency: "EUR", country: "Germany" },
  { ticker: "BMW.DE", name: "BMW AG", sector: "Consumer", industry: "Automobiles", exchange: "XETRA", currency: "EUR", country: "Germany" },
  { ticker: "MBG.DE", name: "Mercedes-Benz Group", sector: "Consumer", industry: "Automobiles", exchange: "XETRA", currency: "EUR", country: "Germany" },
  { ticker: "BAS.DE", name: "BASF SE", sector: "Materials", industry: "Chemicals", exchange: "XETRA", currency: "EUR", country: "Germany" },
  
  // France
  { ticker: "MC.PA", name: "LVMH", sector: "Consumer", industry: "Luxury Goods", exchange: "Euronext Paris", currency: "EUR", country: "France" },
  { ticker: "OR.PA", name: "L'Oreal", sector: "Consumer", industry: "Personal Care", exchange: "Euronext Paris", currency: "EUR", country: "France" },
  { ticker: "TTE.PA", name: "TotalEnergies", sector: "Energy", industry: "Oil & Gas", exchange: "Euronext Paris", currency: "EUR", country: "France" },
  { ticker: "SAN.PA", name: "Sanofi", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "Euronext Paris", currency: "EUR", country: "France" },
  { ticker: "AIR.PA", name: "Airbus SE", sector: "Industrial", industry: "Aerospace", exchange: "Euronext Paris", currency: "EUR", country: "France" },
  { ticker: "BNP.PA", name: "BNP Paribas", sector: "Finance", industry: "Banking", exchange: "Euronext Paris", currency: "EUR", country: "France" },
  
  // Netherlands
  { ticker: "ASML.AS", name: "ASML Holding", sector: "Technology", industry: "Semiconductor Equipment", exchange: "Euronext Amsterdam", currency: "EUR", country: "Netherlands" },
  { ticker: "INGA.AS", name: "ING Group", sector: "Finance", industry: "Banking", exchange: "Euronext Amsterdam", currency: "EUR", country: "Netherlands" },
  { ticker: "PHIA.AS", name: "Philips", sector: "Healthcare", industry: "Medical Devices", exchange: "Euronext Amsterdam", currency: "EUR", country: "Netherlands" },
  
  // Switzerland
  { ticker: "NESN.SW", name: "Nestle SA", sector: "Consumer", industry: "Food & Beverages", exchange: "SIX", currency: "CHF", country: "Switzerland" },
  { ticker: "NOVN.SW", name: "Novartis AG", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "SIX", currency: "CHF", country: "Switzerland" },
  { ticker: "ROG.SW", name: "Roche Holding", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "SIX", currency: "CHF", country: "Switzerland" },
  { ticker: "UBSG.SW", name: "UBS Group", sector: "Finance", industry: "Banking", exchange: "SIX", currency: "CHF", country: "Switzerland" },
  
  // Scandinavia
  { ticker: "NOVO-B.CO", name: "Novo Nordisk", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "Copenhagen", currency: "DKK", country: "Denmark" },
  { ticker: "VOLV-B.ST", name: "Volvo", sector: "Industrial", industry: "Automobiles", exchange: "Stockholm", currency: "SEK", country: "Sweden" },
  { ticker: "EQNR.OL", name: "Equinor ASA", sector: "Energy", industry: "Oil & Gas", exchange: "Oslo", currency: "NOK", country: "Norway" },
  
  // Spain & Italy
  { ticker: "SAN.MC", name: "Banco Santander", sector: "Finance", industry: "Banking", exchange: "Madrid", currency: "EUR", country: "Spain" },
  { ticker: "IBE.MC", name: "Iberdrola", sector: "Utilities", industry: "Electric Utilities", exchange: "Madrid", currency: "EUR", country: "Spain" },
  { ticker: "ENEL.MI", name: "Enel SpA", sector: "Utilities", industry: "Electric Utilities", exchange: "Milan", currency: "EUR", country: "Italy" },
  { ticker: "ISP.MI", name: "Intesa Sanpaolo", sector: "Finance", industry: "Banking", exchange: "Milan", currency: "EUR", country: "Italy" },
]

// ============================================
// ASIAN STOCKS
// ============================================

export const ASIAN_STOCKS: StockInfo[] = [
  // Japan
  { ticker: "7203.T", name: "Toyota Motor Corp.", sector: "Consumer", industry: "Automobiles", exchange: "TSE", currency: "JPY", country: "Japan" },
  { ticker: "6758.T", name: "Sony Group Corp.", sector: "Technology", industry: "Electronics", exchange: "TSE", currency: "JPY", country: "Japan" },
  { ticker: "9984.T", name: "SoftBank Group", sector: "Technology", industry: "Investment", exchange: "TSE", currency: "JPY", country: "Japan" },
  { ticker: "6861.T", name: "Keyence Corp.", sector: "Technology", industry: "Automation", exchange: "TSE", currency: "JPY", country: "Japan" },
  { ticker: "8306.T", name: "Mitsubishi UFJ Financial", sector: "Finance", industry: "Banking", exchange: "TSE", currency: "JPY", country: "Japan" },
  { ticker: "9432.T", name: "Nippon Telegraph & Tel", sector: "Telecom", industry: "Telecommunications", exchange: "TSE", currency: "JPY", country: "Japan" },
  { ticker: "6501.T", name: "Hitachi Ltd.", sector: "Industrial", industry: "Conglomerate", exchange: "TSE", currency: "JPY", country: "Japan" },
  { ticker: "4502.T", name: "Takeda Pharmaceutical", sector: "Healthcare", industry: "Pharmaceuticals", exchange: "TSE", currency: "JPY", country: "Japan" },
  
  // China & Hong Kong
  { ticker: "BABA", name: "Alibaba Group", sector: "Technology", industry: "E-Commerce", exchange: "NYSE", currency: "USD", country: "China" },
  { ticker: "TCEHY", name: "Tencent Holdings (ADR)", sector: "Technology", industry: "Internet", exchange: "OTC", currency: "USD", country: "China" },
  { ticker: "JD", name: "JD.com Inc.", sector: "Technology", industry: "E-Commerce", exchange: "NASDAQ", currency: "USD", country: "China" },
  { ticker: "PDD", name: "PDD Holdings (Pinduoduo)", sector: "Technology", industry: "E-Commerce", exchange: "NASDAQ", currency: "USD", country: "China" },
  { ticker: "BIDU", name: "Baidu Inc.", sector: "Technology", industry: "Internet", exchange: "NASDAQ", currency: "USD", country: "China" },
  { ticker: "NIO", name: "NIO Inc.", sector: "Consumer", industry: "Electric Vehicles", exchange: "NYSE", currency: "USD", country: "China" },
  { ticker: "XPEV", name: "XPeng Inc.", sector: "Consumer", industry: "Electric Vehicles", exchange: "NYSE", currency: "USD", country: "China" },
  { ticker: "LI", name: "Li Auto Inc.", sector: "Consumer", industry: "Electric Vehicles", exchange: "NASDAQ", currency: "USD", country: "China" },
  { ticker: "0700.HK", name: "Tencent Holdings", sector: "Technology", industry: "Internet", exchange: "HKSE", currency: "HKD", country: "Hong Kong" },
  { ticker: "9988.HK", name: "Alibaba Group (HK)", sector: "Technology", industry: "E-Commerce", exchange: "HKSE", currency: "HKD", country: "Hong Kong" },
  { ticker: "1299.HK", name: "AIA Group", sector: "Finance", industry: "Insurance", exchange: "HKSE", currency: "HKD", country: "Hong Kong" },
  
  // Taiwan & Korea
  { ticker: "TSM", name: "Taiwan Semiconductor (ADR)", sector: "Technology", industry: "Semiconductors", exchange: "NYSE", currency: "USD", country: "Taiwan" },
  { ticker: "2330.TW", name: "TSMC", sector: "Technology", industry: "Semiconductors", exchange: "TWSE", currency: "TWD", country: "Taiwan" },
  { ticker: "2317.TW", name: "Hon Hai Precision (Foxconn)", sector: "Technology", industry: "Electronics Manufacturing", exchange: "TWSE", currency: "TWD", country: "Taiwan" },
  { ticker: "005930.KS", name: "Samsung Electronics", sector: "Technology", industry: "Electronics", exchange: "KRX", currency: "KRW", country: "South Korea" },
  { ticker: "000660.KS", name: "SK Hynix", sector: "Technology", industry: "Semiconductors", exchange: "KRX", currency: "KRW", country: "South Korea" },
  { ticker: "035420.KS", name: "Naver Corp.", sector: "Technology", industry: "Internet", exchange: "KRX", currency: "KRW", country: "South Korea" },
  { ticker: "035720.KS", name: "Kakao Corp.", sector: "Technology", industry: "Internet", exchange: "KRX", currency: "KRW", country: "South Korea" },
  
  // India
  { ticker: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy", industry: "Conglomerate", exchange: "NSE", currency: "INR", country: "India" },
  { ticker: "TCS.NS", name: "Tata Consultancy Services", sector: "Technology", industry: "IT Services", exchange: "NSE", currency: "INR", country: "India" },
  { ticker: "INFY", name: "Infosys Ltd. (ADR)", sector: "Technology", industry: "IT Services", exchange: "NYSE", currency: "USD", country: "India" },
  { ticker: "WIT", name: "Wipro Ltd. (ADR)", sector: "Technology", industry: "IT Services", exchange: "NYSE", currency: "USD", country: "India" },
  { ticker: "HDB", name: "HDFC Bank (ADR)", sector: "Finance", industry: "Banking", exchange: "NYSE", currency: "USD", country: "India" },
  { ticker: "IBN", name: "ICICI Bank (ADR)", sector: "Finance", industry: "Banking", exchange: "NYSE", currency: "USD", country: "India" },
]

// ============================================
// CRYPTO & COMMODITIES ETFs
// ============================================

export const CRYPTO_ETFS: StockInfo[] = [
  { ticker: "IBIT", name: "iShares Bitcoin Trust", sector: "Crypto", industry: "Bitcoin ETF", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "FBTC", name: "Fidelity Wise Origin Bitcoin", sector: "Crypto", industry: "Bitcoin ETF", exchange: "CBOE", currency: "USD", country: "USA" },
  { ticker: "GBTC", name: "Grayscale Bitcoin Trust", sector: "Crypto", industry: "Bitcoin Trust", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "ETHE", name: "Grayscale Ethereum Trust", sector: "Crypto", industry: "Ethereum Trust", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "COIN", name: "Coinbase Global", sector: "Crypto", industry: "Crypto Exchange", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "MSTR", name: "MicroStrategy Inc.", sector: "Crypto", industry: "Bitcoin Holding", exchange: "NASDAQ", currency: "USD", country: "USA" },
]

export const COMMODITY_ETFS: StockInfo[] = [
  { ticker: "GLD", name: "SPDR Gold Shares", sector: "Commodities", industry: "Gold ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "SLV", name: "iShares Silver Trust", sector: "Commodities", industry: "Silver ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "USO", name: "United States Oil Fund", sector: "Commodities", industry: "Oil ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "UNG", name: "United States Natural Gas", sector: "Commodities", industry: "Natural Gas ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "DBA", name: "Invesco DB Agriculture", sector: "Commodities", industry: "Agriculture ETF", exchange: "NYSE", currency: "USD", country: "USA" },
]

// ============================================
// INDEX ETFs
// ============================================

export const INDEX_ETFS: StockInfo[] = [
  { ticker: "SPY", name: "SPDR S&P 500 ETF", sector: "Index", industry: "S&P 500 ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "QQQ", name: "Invesco QQQ Trust", sector: "Index", industry: "NASDAQ-100 ETF", exchange: "NASDAQ", currency: "USD", country: "USA" },
  { ticker: "IWM", name: "iShares Russell 2000 ETF", sector: "Index", industry: "Small Cap ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "DIA", name: "SPDR Dow Jones ETF", sector: "Index", industry: "Dow Jones ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "VTI", name: "Vanguard Total Stock Market", sector: "Index", industry: "Total Market ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "VOO", name: "Vanguard S&P 500 ETF", sector: "Index", industry: "S&P 500 ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "EFA", name: "iShares MSCI EAFE ETF", sector: "Index", industry: "International ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "EEM", name: "iShares MSCI Emerging Markets", sector: "Index", industry: "Emerging Markets ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "VWO", name: "Vanguard Emerging Markets", sector: "Index", industry: "Emerging Markets ETF", exchange: "NYSE", currency: "USD", country: "USA" },
  { ticker: "ARKK", name: "ARK Innovation ETF", sector: "Index", industry: "Innovation ETF", exchange: "NYSE", currency: "USD", country: "USA" },
]

// ============================================
// AGGREGATED LISTS
// ============================================

export const ALL_US_STOCKS: StockInfo[] = [
  ...US_TECH,
  ...US_FINANCE,
  ...US_HEALTHCARE,
  ...US_CONSUMER,
  ...US_ENERGY,
  ...US_INDUSTRIAL,
]

export const ALL_STOCKS: StockInfo[] = [
  ...ALL_US_STOCKS,
  ...EUROPEAN_STOCKS,
  ...ASIAN_STOCKS,
  ...CRYPTO_ETFS,
  ...COMMODITY_ETFS,
  ...INDEX_ETFS,
]

// Categories for UI grouping
export const STOCK_CATEGORIES: StockCategory[] = [
  { name: "US Technology", stocks: US_TECH },
  { name: "US Finance", stocks: US_FINANCE },
  { name: "US Healthcare", stocks: US_HEALTHCARE },
  { name: "US Consumer", stocks: US_CONSUMER },
  { name: "US Energy", stocks: US_ENERGY },
  { name: "US Industrial", stocks: US_INDUSTRIAL },
  { name: "European", stocks: EUROPEAN_STOCKS },
  { name: "Asian", stocks: ASIAN_STOCKS },
  { name: "Crypto & Bitcoin", stocks: CRYPTO_ETFS },
  { name: "Commodities", stocks: COMMODITY_ETFS },
  { name: "Index ETFs", stocks: INDEX_ETFS },
]

// Default tickers for ML predictions (most popular)
export const DEFAULT_PREDICTION_TICKERS = [
  // US Tech Leaders
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'ORCL', 'CRM',
  // US Finance
  'JPM', 'BAC', 'WFC', 'GS', 'V', 'MA', 'BLK',
  // US Healthcare
  'UNH', 'JNJ', 'LLY', 'PFE', 'ABBV', 'MRK',
  // US Consumer
  'WMT', 'PG', 'KO', 'COST', 'MCD', 'NKE', 'DIS', 'NFLX',
  // US Energy
  'XOM', 'CVX', 'COP',
  // US Industrial
  'CAT', 'BA', 'HON', 'UPS', 'LMT',
  // European
  'ASML.AS', 'SAP.DE', 'NESN.SW', 'NOVO-B.CO', 'MC.PA', 'SHEL.L',
  // Asian
  'TSM', 'BABA', '7203.T', '005930.KS',
  // ETFs
  'SPY', 'QQQ', 'GLD',
  // Crypto
  'IBIT', 'COIN',
]

// Company names for sentiment analysis
export const COMPANY_NAMES: Record<string, string> = {
  'AAPL': 'Apple',
  'MSFT': 'Microsoft',
  'GOOGL': 'Google Alphabet',
  'AMZN': 'Amazon',
  'NVDA': 'NVIDIA',
  'META': 'Meta Facebook',
  'TSLA': 'Tesla',
  'AVGO': 'Broadcom',
  'ORCL': 'Oracle',
  'CRM': 'Salesforce',
  'ADBE': 'Adobe',
  'CSCO': 'Cisco',
  'INTC': 'Intel',
  'AMD': 'AMD Advanced Micro Devices',
  'IBM': 'IBM',
  'QCOM': 'Qualcomm',
  'JPM': 'JPMorgan Chase',
  'BAC': 'Bank of America',
  'WFC': 'Wells Fargo',
  'GS': 'Goldman Sachs',
  'MS': 'Morgan Stanley',
  'V': 'Visa',
  'MA': 'Mastercard',
  'BLK': 'BlackRock',
  'PYPL': 'PayPal',
  'UNH': 'UnitedHealth',
  'JNJ': 'Johnson Johnson',
  'LLY': 'Eli Lilly',
  'PFE': 'Pfizer',
  'ABBV': 'AbbVie',
  'MRK': 'Merck',
  'WMT': 'Walmart',
  'PG': 'Procter Gamble',
  'KO': 'Coca-Cola',
  'PEP': 'PepsiCo',
  'COST': 'Costco',
  'HD': 'Home Depot',
  'MCD': 'McDonalds',
  'NKE': 'Nike',
  'DIS': 'Disney',
  'NFLX': 'Netflix',
  'XOM': 'Exxon Mobil',
  'CVX': 'Chevron',
  'CAT': 'Caterpillar',
  'BA': 'Boeing',
  'HON': 'Honeywell',
  'UPS': 'UPS',
  'LMT': 'Lockheed Martin',
  'ASML.AS': 'ASML',
  'SAP.DE': 'SAP',
  'NESN.SW': 'Nestle',
  'NOVO-B.CO': 'Novo Nordisk',
  'MC.PA': 'LVMH',
  'SHEL.L': 'Shell',
  'TSM': 'Taiwan Semiconductor TSMC',
  'BABA': 'Alibaba',
  '7203.T': 'Toyota',
  '005930.KS': 'Samsung',
  'SPY': 'S&P 500 ETF',
  'QQQ': 'NASDAQ 100 ETF',
  'GLD': 'Gold ETF',
  'IBIT': 'Bitcoin ETF',
  'COIN': 'Coinbase',
}

// Helper function to get stock by ticker
export function getStockInfo(ticker: string): StockInfo | undefined {
  return ALL_STOCKS.find(s => s.ticker === ticker)
}

// Helper function to get stocks by sector
export function getStocksBySector(sector: string): StockInfo[] {
  return ALL_STOCKS.filter(s => s.sector === sector)
}

// Helper function to get stocks by country
export function getStocksByCountry(country: string): StockInfo[] {
  return ALL_STOCKS.filter(s => s.country === country)
}

// Helper function to search stocks
export function searchStocks(query: string): StockInfo[] {
  const q = query.toLowerCase()
  return ALL_STOCKS.filter(s => 
    s.ticker.toLowerCase().includes(q) || 
    s.name.toLowerCase().includes(q) ||
    s.sector.toLowerCase().includes(q) ||
    (s.industry && s.industry.toLowerCase().includes(q))
  )
}
