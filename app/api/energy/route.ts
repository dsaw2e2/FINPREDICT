import { NextRequest, NextResponse } from 'next/server'
import { getCompanyData, CompanyData } from '@/lib/finance-api'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 минут (реал-тайм)

const ENERGY_COMPANIES = {
  global: [
    { ticker: '2222.SR', name: 'Saudi Aramco', country: 'Saudi Arabia' },
    { ticker: 'XOM', name: 'ExxonMobil', country: 'USA' },
    { ticker: 'CVX', name: 'Chevron', country: 'USA' },
    { ticker: 'COP', name: 'ConocoPhillips', country: 'USA' },
  ],
  europe: [
    // Oil & Gas
    { ticker: 'SHEL.L', name: 'Shell plc', country: 'UK/Netherlands' },
    { ticker: 'BP.L', name: 'BP plc', country: 'UK' },
    { ticker: 'TTE.PA', name: 'TotalEnergies', country: 'France' },
    { ticker: 'EQNR.OL', name: 'Equinor ASA', country: 'Norway' },
    { ticker: 'OMV.VI', name: 'OMV AG', country: 'Austria' },
    // Utilities & Power
    { ticker: 'ENEL.MI', name: 'Enel SpA', country: 'Italy' },
    { ticker: 'IBE.MC', name: 'Iberdrola SA', country: 'Spain' },
    { ticker: 'EOAN.DE', name: 'E.ON SE', country: 'Germany' },
    { ticker: 'RWE.DE', name: 'RWE AG', country: 'Germany' },
    { ticker: 'ENGI.PA', name: 'Engie SA', country: 'France' },
    { ticker: 'NG.L', name: 'National Grid plc', country: 'UK' },
    { ticker: 'SSE.L', name: 'SSE plc', country: 'UK' },
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') // 'global', 'europe', 'all'

    let companiesToFetch = []
    if (region === 'global') {
      companiesToFetch = ENERGY_COMPANIES.global
    } else if (region === 'europe') {
      companiesToFetch = ENERGY_COMPANIES.europe
    } else {
      companiesToFetch = [...ENERGY_COMPANIES.global, ...ENERGY_COMPANIES.europe]
    }

    console.log('[v0] Fetching energy data for', companiesToFetch.length, 'companies')

    const promises = companiesToFetch.map(async (company) => {
      try {
        const data = await getCompanyData(company.ticker)
        if (data) {
          return { ...company, ...data }
        }
        return null
      } catch (error) {
        console.error(`[v0] Failed to fetch ${company.ticker}:`, error)
        return null
      }
    })

    const results = await Promise.allSettled(promises)
    const validCompanies = results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<any>).value)

    const grouped = {
      global: validCompanies.filter(c => ENERGY_COMPANIES.global.some(g => g.ticker === c.ticker)),
      europe: validCompanies.filter(c => ENERGY_COMPANIES.europe.some(e => e.ticker === c.ticker))
    }

    console.log('[v0] Energy data fetched:', {
      global: grouped.global.length,
      europe: grouped.europe.length,
      total: validCompanies.length
    })

    return NextResponse.json({
      lastUpdated: new Date().toISOString(),
      region: region || 'all',
      global: grouped.global,
      europe: grouped.europe,
      totalCompanies: validCompanies.length,
      successRate: `${((validCompanies.length) / companiesToFetch.length * 100).toFixed(1)}%`
    })
  } catch (error) {
    console.error('[v0] Energy API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch energy data' },
      { status: 500 }
    )
  }
}
