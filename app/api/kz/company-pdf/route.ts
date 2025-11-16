import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface CompanyReport {
  company: string
  year: number
  url: string
  data?: string
  error?: string
}

const COMPANY_REPORTS = {
  KEGOC: [
    { year: 2023, url: 'https://www.kegoc.kz/upload/iblock/45e/kegoc_ar_2023_ru.pdf' },
    { year: 2022, url: 'https://www.kegoc.kz/upload/iblock/f5e/kegoc_ar_2022_ru.pdf' },
  ],
  'Samruk-Energy': [
    { year: 2023, url: 'https://www.samruk-energy.kz/upload/iblock/2f4/ar_2023.pdf' },
    { year: 2022, url: 'https://www.samruk-energy.kz/upload/iblock/8e1/ar_2022.pdf' },
  ],
  KMG: [
    { year: 2023, url: 'https://www.kmg.kz/uploads/files/KMG_AR2023_RU.pdf' },
    { year: 2022, url: 'https://www.kmg.kz/uploads/files/KMG_AR2022_RU.pdf' },
  ],
  KazTransOil: [
    { year: 2023, url: 'https://www.kaztransoil.kz/upload/iblock/annual_report_2023.pdf' },
    { year: 2022, url: 'https://www.kaztransoil.kz/upload/iblock/annual_report_2022.pdf' },
  ],
  MAEK: [
    { year: 2023, url: 'https://www.maec.kz/upload/documents/ar_2023_ru.pdf' },
    { year: 2022, url: 'https://www.maec.kz/upload/documents/ar_2022_ru.pdf' },
  ],
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const company = searchParams.get('company')
  const year = searchParams.get('year')

  try {
    if (company && COMPANY_REPORTS[company as keyof typeof COMPANY_REPORTS]) {
      const reports = COMPANY_REPORTS[company as keyof typeof COMPANY_REPORTS]
      const targetReport = year 
        ? reports.find(r => r.year === parseInt(year))
        : reports[0]

      if (!targetReport) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      const response = await fetch(targetReport.url, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('pdf')) {
        console.error(`[v0] Invalid content type for ${company}: ${contentType}`)
        throw new Error('Response is not a PDF')
      }

      const buffer = await response.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')

      return NextResponse.json({
        success: true,
        company,
        year: targetReport.year,
        url: targetReport.url,
        data: base64,
        size: buffer.byteLength,
      })
    }

    // Return all available reports
    const allReports: CompanyReport[] = []
    for (const [companyName, reports] of Object.entries(COMPANY_REPORTS)) {
      reports.forEach(report => {
        allReports.push({
          company: companyName,
          year: report.year,
          url: report.url,
        })
      })
    }

    return NextResponse.json({
      success: true,
      reports: allReports,
    })
  } catch (error) {
    console.error('[v0] PDF fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch PDF'
      },
      { status: 500 }
    )
  }
}
