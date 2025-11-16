export interface CompanyInfo {
  ticker: string
  name: string
  country: string
  flag: string
  description: string
  sector: string
}

export const energyCompaniesInfo: Record<string, CompanyInfo> = {
  '2222.SR': {
    ticker: '2222.SR',
    name: 'Saudi Aramco',
    country: 'Саудовская Аравия',
    flag: '🇸🇦',
    description: 'Крупнейшая нефтегазовая компания в мире. Добыча нефти, газа, переработка, экспорт. Основная опора экономики Саудовской Аравии.',
    sector: 'Нефть и газ'
  },
  'XOM': {
    ticker: 'XOM',
    name: 'ExxonMobil',
    country: 'США',
    flag: '🇺🇸',
    description: 'Одна из крупнейших нефтегазовых компаний мира. Добыча нефти/газа, нефтепереработка, химия, топливо, нефтехимия.',
    sector: 'Нефть и газ'
  },
  'CVX': {
    ticker: 'CVX',
    name: 'Chevron',
    country: 'США',
    flag: '🇺🇸',
    description: 'Нефть и газ: добыча, переработка, нефтехимия. Работает в США, Африке, Азиатско-Тихоокеанском регионе.',
    sector: 'Нефть и газ'
  },
  'COP': {
    ticker: 'COP',
    name: 'ConocoPhillips',
    country: 'США',
    flag: '🇺🇸',
    description: 'Ориентирована на добычу нефти и природного газа. Одна из крупнейших независимых нефтедобывающих компаний.',
    sector: 'Нефть и газ'
  },
  'SHEL.L': {
    ticker: 'SHEL.L',
    name: 'Shell',
    country: 'Великобритания/Нидерланды',
    flag: '🇬🇧🇳🇱',
    description: 'Нефтегаз + переход к зеленой энергетике. Нефть, газ, электричество, СПГ, сети АЗС по всему миру.',
    sector: 'Нефть и газ'
  },
  'BP.L': {
    ticker: 'BP.L',
    name: 'BP',
    country: 'Великобритания',
    flag: '🇬🇧',
    description: 'Нефть и газ, переработка, электроэнергия, развитие ВИЭ. Известна брендом "BP" и сетью АЗС.',
    sector: 'Нефть и газ'
  },
  'TTE.PA': {
    ticker: 'TTE.PA',
    name: 'TotalEnergies',
    country: 'Франция',
    flag: '🇫🇷',
    description: 'Нефть, газ, СПГ, солнечная и ветровая энергетика. Одна из крупнейших европейских мультиэнергетических компаний.',
    sector: 'Нефть и газ'
  },
  'EQNR.OL': {
    ticker: 'EQNR.OL',
    name: 'Equinor',
    country: 'Норвегия',
    flag: '🇳🇴',
    description: 'Государственная энергетическая компания. Огромная добыча газа на шельфе Северного моря, сильный фокус на зелёную энергетику.',
    sector: 'Нефть и газ'
  },
  'OMV.VI': {
    ticker: 'OMV.VI',
    name: 'OMV',
    country: 'Австрия',
    flag: '🇦🇹',
    description: 'Нефтегазовая компания Центральной Европы. Работает в Европе и на Ближнем Востоке. Добыча, переработка, нефтехимия.',
    sector: 'Нефть и газ'
  },
  'ENEL.MI': {
    ticker: 'ENEL.MI',
    name: 'Enel',
    country: 'Италия',
    flag: '🇮🇹',
    description: 'Одна из крупнейших электрогенерирующих компаний Европы. Ветки бизнеса: электроэнергия, ВИЭ (Enel Green Power), инфраструктура.',
    sector: 'Электроэнергия'
  },
  'IBE.MC': {
    ticker: 'IBE.MC',
    name: 'Iberdrola',
    country: 'Испания',
    flag: '🇪🇸',
    description: 'Мировой лидер по ветровой энергетике. Также электроэнергия, сети, ВИЭ.',
    sector: 'ВИЭ'
  },
  'EOAN.DE': {
    ticker: 'EOAN.DE',
    name: 'E.ON',
    country: 'Германия',
    flag: '🇩🇪',
    description: 'Крупнейшая европейская энергетическая компания в сфере: электросети, распределение энергии, обслуживание клиентов.',
    sector: 'Электроэнергия'
  },
  'RWE.DE': {
    ticker: 'RWE.DE',
    name: 'RWE',
    country: 'Германия',
    flag: '🇩🇪',
    description: 'Сильная сторона — электрогенерация, в том числе уголь, газ и ВИЭ. Активно инвестирует в ветровые парки.',
    sector: 'Электроэнергия'
  },
  'ENGI.PA': {
    ticker: 'ENGI.PA',
    name: 'Engie',
    country: 'Франция',
    flag: '🇫🇷',
    description: 'Электричество, газ, тепло, развитие ВИЭ. Одна из самых крупных энергетических компаний Европы.',
    sector: 'Электроэнергия'
  },
  'NG.L': {
    ticker: 'NG.L',
    name: 'National Grid',
    country: 'Великобритания',
    flag: '🇬🇧',
    description: 'Управляет электроэнергетическими и газовыми сетями Великобритании и США. Не добывает, а распределяет энергию.',
    sector: 'Электросети'
  },
  'SSE.L': {
    ticker: 'SSE.L',
    name: 'SSE',
    country: 'Великобритания',
    flag: '🇬🇧',
    description: 'Электричество, тепловая энергия, ветровые станции. Один из лидеров по оффшорным (морским) ветропаркам.',
    sector: 'ВИЭ'
  }
}
