import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

interface KazDataResponse {
  electricity_production: any
  oil_production: any
  oil_export: any
  gas_production: any
  coal_production: any
}

export async function GET(request: NextRequest) {
  try {
    const [electricityRes, oilRes, oilExportRes, gasRes, coalRes] = await Promise.all([
      fetch('https://stat.gov.kz/api/get?indicator=102048&format=json'), // Electricity production
      fetch('https://stat.gov.kz/api/get?indicator=101756&format=json'), // Oil production
      fetch('https://stat.gov.kz/api/get?indicator=101757&format=json'), // Oil export
      fetch('https://stat.gov.kz/api/get?indicator=102049&format=json'), // Gas production
      fetch('https://stat.gov.kz/api/get?indicator=102050&format=json'), // Coal production
    ])

    const data: KazDataResponse = {
      electricity_production: await electricityRes.json().catch(() => null),
      oil_production: await oilRes.json().catch(() => null),
      oil_export: await oilExportRes.json().catch(() => null),
      gas_production: await gasRes.json().catch(() => null),
      coal_production: await coalRes.json().catch(() => null),
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] KazData API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch KazData'
      },
      { status: 500 }
    )
  }
}
