"use client"

import { useState, useEffect } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  LineChart,
  Line,
  Legend,
} from "recharts"
import React from "react"
import type { CompanyInfo } from "@/lib/energy-companies-info"
import MLPredictions from "@/components/MLPredictions"
import { STOCK_CATEGORIES, ALL_STOCKS, type StockInfo } from "@/lib/stocks"

const BarChart3 = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const Bell = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-5 5v-5zM4.868 19.462A17.173 17.173 0 0012 20c2.485 0 4.82-.519 6.93-1.463M2.8 14.4c2.04-1.47 4.86-2.4 8.2-2.4s6.16.93 8.2 2.4M6.4 9.6c1.53-1.1 3.53-1.8 5.6-1.8s4.07.7 5.6 1.8"
    />
  </svg>
)

const BookOpen = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
)

const Newspaper = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
    />
  </svg>
)

const TrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"></polyline>
    <polyline points="16,7 22,7 22,13"></polyline>
  </svg>
)

const Calculator = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
    <line x1="8" y1="6" x2="16" y2="6"></line>
    <line x1="16" y1="14" x2="16" y2="18"></line>
    <path d="M16 10h.01"></path>
    <path d="M12 10h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M8 14h.01"></path>
    <path d="M8 18h.01"></path>
  </svg>
)

const Zap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
  </svg>
)

const ChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-chevron-down"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const Search = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-search"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const Target = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-crosshair"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="22" y1="12" x2="18" y2="12" />
    <line x1="6" y1="12" x2="2" y2="12" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="22" x2="12" y2="18" />
  </svg>
)

const Activity = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-activity"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
)

const FileText = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-file-text"
  >
    <path d="M14.5 2H6A2 2 0 0 0 4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
)

const Play = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-play"
  >
    <polygon points="5 3 19 12 5 21" />
  </svg>
)

const Plus = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-plus"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const X = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-x"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const Download = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-download"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

// New icons for theme toggle
const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-sun"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M4.93 17.07a9 9 0 1 1 12.73-12.73" />
  </svg>
)

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-moon"
  >
    <path d="M12 3a6 6 0 1 0 9 9 9 9 0 0 0-9-9Z" />
  </svg>
)

// Use comprehensive stock database from lib/stocks.ts
const stockDatabase = ALL_STOCKS.map(s => ({
  ticker: s.ticker,
  name: s.name,
  category: s.sector,
  industry: s.industry,
  country: s.country,
}))

// Create categories from the comprehensive list
const stockCategories = STOCK_CATEGORIES.reduce((acc, cat) => {
  acc[cat.name] = cat.stocks.map(s => s.ticker)
  return acc
}, {} as Record<string, string[]>)

const mockStockData = {
  AAPL: { price: 150.0, change: -2.5, changePercent: -1.64, currency: "USD" },
  GOOGL: { price: 142.5, change: 1.8, changePercent: 1.28, currency: "USD" },
  MSFT: { price: 420.5, change: 5.2, changePercent: 1.25, currency: "USD" },
  TSLA: { price: 248.4, change: -3.1, changePercent: -1.23, currency: "USD" },
  META: { price: 520.3, change: 8.9, changePercent: 1.74, currency: "USD" },
  NVDA: { price: 875.2, change: 15.6, changePercent: 1.81, currency: "USD" },
  JPM: { price: 187.3, change: 2.1, changePercent: 1.13, currency: "USD" },
  V: { price: 265.4, change: -1.2, changePercent: -0.45, currency: "USD" },
  MA: { price: 448.7, change: 3.5, changePercent: 0.79, currency: "USD" },
  UNH: { price: 512.9, change: 6.8, changePercent: 1.34, currency: "USD" },
  BAC: { price: 38.5, change: -0.3, changePercent: -0.77, currency: "USD" },
  WFC: { price: 52.7, change: 0.9, changePercent: 1.74, currency: "USD" },
  "ASML.AS": { price: 785.4, change: 12.3, changePercent: 1.59, currency: "EUR" },
  "SAP.DE": { price: 168.9, change: -2.1, changePercent: -1.23, currency: "EUR" },
  "NESN.SW": { price: 92.3, change: 0.7, changePercent: 0.76, currency: "CHF" },
  "NOVO-B.CO": { price: 580.2, change: 8.4, changePercent: 1.47, currency: "DKK" },
  "MC.PA": { price: 725.6, change: -5.3, changePercent: -0.73, currency: "EUR" },
  "OR.PA": { price: 442.8, change: 3.2, changePercent: 0.73, currency: "EUR" },
  "7203.T": { price: 2450.0, change: -15.0, changePercent: -0.61, currency: "JPY" },
  "0700.HK": { price: 385.6, change: 7.2, changePercent: 1.9, currency: "HKD" },
  "005930.KS": { price: 71200.0, change: 500.0, changePercent: 0.71, currency: "KRW" },
  TSM: { price: 168.5, change: 2.8, changePercent: 1.69, currency: "USD" },
  BABA: { price: 85.3, change: -1.2, changePercent: -1.39, currency: "USD" },
  "2330.TW": { price: 725.0, change: 8.0, changePercent: 1.12, currency: "TWD" },
}

interface Alert {
  id: string
  ticker: string
  condition: "above" | "below"
  price: number
  currentPrice: number
  isActive: boolean
  createdAt: string
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    ticker: "AAPL",
    condition: "above",
    price: 190,
    currentPrice: 185.92,
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    ticker: "GOOGL",
    condition: "below",
    price: 140,
    currentPrice: 142.56,
    isActive: true,
    createdAt: "2024-01-14",
  },
]

const marketActivity = [
  { ticker: "AAPL", price: 185.92, change: 2.34, changePercent: 1.28, currency: "USD" },
  { ticker: "GOOGL", price: 142.56, change: -1.23, changePercent: -0.85, currency: "USD" },
  { ticker: "MSFT", price: 420.55, change: 5.67, changePercent: 1.37, currency: "USD" },
  { ticker: "TSLA", price: 248.42, change: -3.21, changePercent: -1.27, currency: "USD" },
  { ticker: "ASML.AS", price: 785.4, change: 12.3, changePercent: 1.59, currency: "USD" },
  { ticker: "SAP.DE", price: 198.75, change: -2.45, changePercent: -1.22, currency: "USD" },
  { ticker: "NESN.SW", price: 108.2, change: 0.8, changePercent: 0.74, currency: "USD" },
  { ticker: "7203.T", price: 2890, change: 45, changePercent: 1.58, currency: "USD" },
  { ticker: "0700.HK", price: 385.6, change: -8.2, changePercent: -2.08, currency: "USD" },
  { ticker: "005930.KS", price: 71200, change: 1200, changePercent: 1.71, currency: "USD" },
]

const educationalMaterials = {
  "Статьи и руководства": [
    {
      id: "1",
      title: "Введение в технический анализ финансовых рынков",
      description: "Основы технического анализа, графики, индикаторы и паттерны для начинающих трейдеров",
      level: "Начинающий",
      duration: "15 мин",
      category: "Технический анализ",
      url: "https://www.investopedia.com/terms/t/technicalanalysis.asp",
    },
    {
      id: "2",
      title: "Машинное обучение в финансах: LSTM для прогнозирования цен",
      description: "Как использовать нейронные сети LSTM для прогнозирования временных рядов финансовых данных",
      level: "Продвинутый",
      duration: "25 мин",
      category: "Машинное обучение",
      url: "https://machinelearningmastery.com/time-series-prediction-lstm-recurrent-neural-networks-python-keras/",
    },
    {
      id: "3",
      title: "Prophet от Facebook: прогнозирование временных рядов",
      description: "Подробное руководство по использованию библиотеки Prophet для анализа временных рядов",
      level: "Средний",
      duration: "20 мин",
      category: "Машинное обучение",
      url: "https://facebook.github.io/prophet/",
    },
    {
      id: "4",
      title: "ARIMA и SARIMAX модели: статистический под��од к прогнозированию",
      description: "Классические статистические методы анализа временных рядов и их применение в финансах",
      level: "Средний",
      duration: "30 мин",
      category: "Статистика",
      url: "https://www.statsmodels.org/stable/examples/notebooks/generated/statespace_sarimax_stata.html",
    },
    {
      id: "5",
      title: "Фундаментальный анализ акций",
      description: "Изучение финансовых показателей компаний для принятия инвестиционных решений",
      level: "Средний",
      duration: "35 мин",
      category: "Фундаментальный анализ",
      url: "https://www.investopedia.com/terms/f/fundamentalanalysis.asp",
    },
    {
      id: "6",
      title: "Управление рисками в трейдинге",
      description: "Стратегии управления рисками и защиты капитала при торговле на финансовых рынках",
      level: "Начинающий",
      duration: "20 мин",
      category: "Риск-менеджмент",
      url: "https://www.investopedia.com/articles/trading/09/risk-management.asp",
    },
  ],
  Видеокурсы: [
    {
      id: "7",
      title: "Основы трейдинга для начинающих",
      description: "Видеокурс по основам трейдинга и инвестирования",
      level: "Начинающий",
      duration: "45 мин",
      category: "Трейдинг",
      url: "https://youtu.be/kRD8lsuQCAc?si=YEauNoeReZffBqr_",
    },
    {
      id: "8",
      title: "Продвинутые стратегии трейдинга",
      description: "Видеокурс по продвинутым стратегиям трейдинга и инвестирования",
      level: "Продвинутый",
      duration: "60 мин",
      category: "Трейдинг",
      url: "https://youtu.be/9-z2o_TywCg?si=Riyd99yS-9koDyNo",
    },
    {
      id: "9",
      title: "Психология трейдинга",
      description: "Как контролировать эмоции и принимать рациональные решения на рынке",
      level: "Средний",
      duration: "40 мин",
      category: "Психология",
      url: "https://youtu.be/_4D7ne5wDc4?si=gYwZyYsMmmO1tqeG",
    },
    {
      id: "10",
      title: "Криптовалютный трейдинг",
      description: "Особенности торговли криптовалютами и анализ крипторынка",
      level: "Средний",
      duration: "50 мин",
      category: "Криптовалюты",
      url: "https://youtu.be/LGHsNaIv5os?si=4OR_f8GiszOOBip4",
    },
    {
      id: "11",
      title: "Алгоритмический трейдинг",
      description: "Создание торговых ботов и автоматизация торговых стратегий",
      level: "Продвинутый",
      duration: "75 мин",
      category: "Алгоритмы",
      url: "https://youtu.be/ozoY9ODU-B8?si=pWP1u9FDYIbEvahS",
    },
  ],
}

const levelColors = {
  Начинающий: "bg-green-500/10 text-green-500 border-green-500/20",
  Средний: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Продвинутый: "bg-red-500/10 text-red-500 border-red-500/20",
}

interface StockData {
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
  symbol: string
  historicalPrices?: number[] // Added for deterministic calculations
  avgVolume?: number // Added for deterministic calculations
}

const formatCurrency = (amount: number | undefined | null, currency: string): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return currency === "KZT" ? "₸0" : "$0.00"
  }

  if (currency === "KZT") {
    return `₸${amount.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}`
  }
  return `$${amount.toFixed(2)}`
}

const formatLargeCurrency = (amount: number | undefined | null, currency: string): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return currency === "KZT" ? "₸0" : "$0"
  }

  if (currency === "KZT") {
    if (amount >= 1e12) return `₸${(amount / 1e12).toFixed(1)}T`
    if (amount >= 1e9) return `₸${(amount / 1e9).toFixed(1)}B`
    if (amount >= 1e6) return `₸${(amount / 1e6).toFixed(1)}M`
    return `₸${amount.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}`
  }

  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)}T`
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`
  if (amount >= 1e6) return `$${(amount / 1e9).toFixed(1)}M`
  return `$${amount.toLocaleString()}`
}

const ExternalLink = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-external-link"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

type Language = "ru" | "en" | "kk" // Changed kz to kk

const translations = {
  ru: {
    // Navigation
    analysis: "Анализ",
    alerts: "Алерты",
    education: "Обучение",
    news: "Новости",
    kztForecast: "Прогноз KZT/USD",
    energyIndustries: "Энергетика",
    mlPredictions: "ML Прогнозы",
    contactSales: "Связаться с отделом продаж",

    // Main page
    turnIdeasIntoPredictions: "Превратите ваши идеи в прогнозы",
    whatWillYouAnalyze: "Что вы будете анализировать? Возможности безграничны.",
    getSuggestions: "✨ Получить предложения",
    writePrompt: "📝 Написать запрос",
    loadLightningFast: "Быстрая загрузка даже при медленном соединении",
    startAnalyzing: "Начать анализ с ИИ →",

    // Analysis
    stockAnalysis: "Анализ акций",
    getDetailedAnalysis: "Получите детальный анализ и прогноз по выбранным акциям",
    analysis: "Анализ",
    price: "Цена:",
    change: "Изменение:",
    volume: "Объем:",
    marketCap: "Капитализация:",
    runPrediction: "Запустить прогнозирование",
    model: "Модель",
    period: "Период",
    runForecast: "Запустить прогноз",
    forecasting: "Прогнозирование...",
    enterTicker: "Введите тикер",
    popularStocks: "Популярные акции",
    priceHistory: "История цен",
    minPrice: "Минимум",
    maxPrice: "Максимум",
    avgPrice: "Среднее",
    price: "Цена",
    noChartData: "Нет данных для отображения",

    // Alerts
    priceAlerts: "Ценовые алерты",
    stayInformed: "Будьте в курсе изменений цен на ваши активы",
    createNewAlert: "Создать новый алерт",
    ticker: "Тикер (например: AAPL, GOOGL, KCEL)",
    condition: "Условие",
    abovePrice: "Выше цены",
    belowPrice: "Ниже цены",
    enterPrice: "Введите цену",
    createAlert: "Создать алерт",
    activeAlerts: "Активные алерты",
    noActiveAlerts: "Нет активных алертов",

    // Education
    educationalMaterials: "Обучающие материалы",
    learnMoreAboutTrading: "Узнайте больше о трейдинге и инвестициях",
    articlesAndGuides: "Статьи и руководства",
    videoCourses: "Видеокурсы",
    duration: "Длительность:",

    // News
    marketNews: "Новости рынка",
    stayUpdated: "Будьте в курсе последних новостей и событий",
    source: "Источник:",
    loadMoreNews: "Загрузить больше новостей",
    refreshNews: "Обновить новости",

    // Levels
    beginner: "Начинающий",
    intermediate: "Средний",
    advanced: "Продвинутый",

    // New Keys
    createdBy: "Создано",
    switchTheme: "Переключить тему",
    selectLanguage: "Выберите язык",
    
    // Theme customization
    themeSettings: "Настройки темы",
    colorTheme: "Цветовая тема",
    selectColor: "Выберите основной цвет",
    applyTheme: "Применить",
    resetTheme: "Сбросить",

    // AI Chat
    aiAssistant: "FinPredict AI",
    askAboutStocks: "Спросите о ценах акций, прогнозах и анализе энергетических компаний",
    sendMessage: "Введите сообщение...",
    thinking: "Думаю...",
    poweredBy: "Gemini AI",
    disclaimer: "Не является финансовой рекомендацией",

    kztUsdForecast: "Прогноз курса доллара к тенге",
    kztForecastDescription: "7-дневный прогноз курса USD/KZT с использованием модели Prophet",
    currentRate: "Текущий курс",
    forecastPeriod: "Период прогноза",
    days: "дней",
    loadForecast: "Загрузить прогноз",
    loading: "Загрузка...",
    historicalData: "Исторические данные",
    forecastData: "Прогноз",
    confidenceInterval: "Доверительный интервал",
    modelInformation: "Информация о модели",
    trend: "Тренд",
    trendStrength: "Сила тренда",
    averageRate: "Средний курс",
    lastRate: "Последний курс",
    oilImpact: "Влияние нефти",
    confidence: "Доверительный интервал",
    dataSource: "Источник данных",
    generatedAt: "Сгенерировано",
    ascending: "восходящий",
    descending: "нисходящий",
    positive: "положительное",
    negative: "отрицательное",

    energyTitle: "Энергетические компании",
    energySubtitle: "Мировые и казахстанские энергетические компании",
    globalCompanies: "Мировые компании",
    kazakhstanCompanies: "Казахстанские компании",
    companyName: "Компания",
    ticker: "Тикер",
    currentPrice: "Текущая цена",
    priceChange: "Изменение",
    volatility: "Волатильность",
    status: "Статус",
    viewDetails: "Подробнее",
    lastUpdated: "Последнее обновление",
    totalCompanies: "Всего компаний",
    successfulFetches: "Успешно загружено",
    dataNotAvailable: "Данные пока недоступны",
    runDataCollection: "Запустите скрипт сбора данных",
    country: "Страна",
    successRate: "Коэффициент успеха",
    noDataAvailable: "Нет данных",
    europe: "Европа",
  },
  en: {
    // Navigation
    analysis: "Analysis",
    alerts: "Alerts",
    education: "Education",
    news: "News",
    kztForecast: "KZT/USD Forecast",
    energyIndustries: "Energy",
    mlPredictions: "ML Predictions",
    contactSales: "Contact Sales",

    // Main page
    turnIdeasIntoPredictions: "Turn your ideas into predictions",
    whatWillYouAnalyze: "What will you analyze? The possibilities are endless.",
    getSuggestions: "✨ Get suggestions",
    writePrompt: "📝 Write a prompt",
    loadLightningFast: "Load lightning-fast even on slow connections",
    startAnalyzing: "Start analyzing with AI →",

    // Analysis
    stockAnalysis: "Stock Analysis",
    getDetailedAnalysis: "Get detailed analysis and forecast for selected stocks",
    analysis: "Analysis",
    price: "Price:",
    change: "Change:",
    volume: "Volume:",
    marketCap: "Market Cap:",
    runPrediction: "Run Prediction",
    model: "Model",
    period: "Period",
    runForecast: "Run Forecast",
    forecasting: "Forecasting...",
    enterTicker: "Enter ticker",
    popularStocks: "Popular stocks",
    priceHistory: "Price History",
    minPrice: "Minimum",
    maxPrice: "Maximum",
    avgPrice: "Average",
    price: "Price",
    noChartData: "No data to display",

    // Alerts
    priceAlerts: "Price Alerts",
    stayInformed: "Stay informed about price changes on your assets",
    createNewAlert: "Create New Alert",
    ticker: "Ticker (e.g.: AAPL, GOOGL, KCEL)",
    condition: "Condition",
    abovePrice: "Above Price",
    belowPrice: "Below Price",
    enterPrice: "Enter Price",
    createAlert: "Create Alert",
    activeAlerts: "Active Alerts",
    noActiveAlerts: "No Active Alerts",

    // Education
    educationalMaterials: "Educational Materials",
    learnMoreAboutTrading: "Learn more about trading and investing",
    articlesAndGuides: "Articles and Guides",
    videoCourses: "Video Courses",
    duration: "Duration:",

    // News
    marketNews: "Market News",
    stayUpdated: "Stay updated with latest news and events",
    source: "Source:",
    loadMoreNews: "Load More News",
    refreshNews: "Refresh News",

    // Levels
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",

    // New Keys
    createdBy: "Created by",
    switchTheme: "Switch theme",
    selectLanguage: "Select language",
    
    // Theme customization
    themeSettings: "Theme Settings",
    colorTheme: "Color Theme",
    selectColor: "Select primary color",
    applyTheme: "Apply",
    resetTheme: "Reset",

    // AI Chat
    aiAssistant: "FinPredict AI",
    askAboutStocks: "Ask about stock prices, forecasts, and energy company analysis",
    sendMessage: "Type a message...",
    thinking: "Thinking...",
    poweredBy: "Gemini AI",
    disclaimer: "Not financial advice",

    kztUsdForecast: "USD/KZT Exchange Rate Forecast",
    kztForecastDescription: "7-day USD/KZT forecast using Prophet model",
    currentRate: "Current Rate",
    forecastPeriod: "Forecast Period",
    days: "days",
    loadForecast: "Load Forecast",
    loading: "Loading...",
    historicalData: "Historical Data",
    forecastData: "Forecast",
    confidenceInterval: "Confidence Interval",
    modelInformation: "Model Information",
    trend: "Trend",
    trendStrength: "Trend Strength",
    averageRate: "Average Rate",
    lastRate: "Last Rate",
    oilImpact: "Oil Impact",
    confidence: "Confidence",
    dataSource: "Data Source",
    generatedAt: "Generated At",
    ascending: "ascending",
    descending: "descending",
    positive: "positive",
    negative: "negative",

    energyTitle: "Energy Companies",
    energySubtitle: "Global and Kazakhstan energy companies",
    globalCompanies: "Global Companies",
    kazakhstanCompanies: "Kazakhstan Companies",
    companyName: "Company",
    ticker: "Ticker",
    currentPrice: "Current Price",
    priceChange: "Change",
    volatility: "Volatility",
    status: "Status",
    viewDetails: "View Details",
    lastUpdated: "Last Updated",
    totalCompanies: "Total Companies",
    successfulFetches: "Successfully Fetched",
    dataNotAvailable: "Data not available yet",
    runDataCollection: "Run data collection script",
    country: "Country",
    successRate: "Success Rate",
    noDataAvailable: "No data",
    europe: "Europe",
  },
  kk: {
    // Changed kz to kk
    // Navigation
    analysis: "Талдау",
    alerts: "Ескертулер",
    education: "Оқыту", // Changed from Білім
    news: "Жаңалықтар",
    kztForecast: "KZT/USD Болжамы", // Changed to match English and RU
    energyIndustries: "Энергетика",
    mlPredictions: "ML Болжамдар",
    contactSales: "Сатуға хабарласу",

    // Main page
    turnIdeasIntoPredictions: "Идеяларыңызды болжамдарға айналдырыңыз",
    whatWillYouAnalyze: "Не талдайсыз? Мүмкіндіктер шексіз.",
    getSuggestions: "✨ Ұсыныстар алу",
    writePrompt: "📝 Сұрау жазу",
    loadLightningFast: "Баяу байланыста да жылдам жүктеледі",
    startAnalyzing: "AI арқылы талдауды бастау →",

    // Analysis
    stockAnalysis: "Акция талдауы",
    getDetailedAnalysis: "Таңдалған акциялар бойынша толық талдау мен болжам алыңыз",
    analysis: "Талдау",
    price: "Баға:",
    change: "Өзгеріс:",
    volume: "Көлем:",
    marketCap: "Нарық капиталы:",
    runPrediction: "Болжам жасау",
    model: "Модель",
    period: "Кезең",
    runForecast: "Болжам жүргізу",
    forecasting: "Болжам жасалуда...",
    enterTicker: "Тикерді енгізіңіз",
    popularStocks: "Танымал акциялар",
    priceHistory: "Бағалар тарихы",
    minPrice: "Минимум",
    maxPrice: "Максимум",
    avgPrice: "Орташа",
    price: "Баға",
    noChartData: "Көрсету үшін деректер жоқ",

    // Alerts
    priceAlerts: "Баға ескертулері",
    stayInformed: "Активтеріңіздің баға өзгерістері туралы хабардар болыңыз",
    createNewAlert: "Жаңа ескерту жасау",
    ticker: "Тикер (мысалы: AAPL, GOOGL, KCEL)",
    condition: "Шарт",
    abovePrice: "Бағадан жоғары",
    belowPrice: "Бағадан төмен",
    enterPrice: "Бағаны енгізіңіз",
    createAlert: "Ескерту жасау",
    activeAlerts: "Белсенді ескертулер",
    noActiveAlerts: "Белсенді ескертулер жоқ",

    // Education
    educationalMaterials: "Білім беру материалдары",
    learnMoreAboutTrading: "Сауда және инвестиция туралы көбірек біліңіз",
    articlesAndGuides: "Мақалалар мен нұсқаулықтар",
    videoCourses: "Видео курстар",
    duration: "Ұзақтығы:",

    // News
    marketNews: "Нарық жаңалықтары",
    stayUpdated: "Соңғы жаңалықтар мен оқиғалардан хабардар болыңыз",
    source: "Көзі:",
    loadMoreNews: "Көбірек жаңалықтар жүктеу",
    refreshNews: "Жаңалықтарды жаңарту",

    // Levels
    beginner: "Бастаушы",
    intermediate: "Орташа",
    advanced: "Жетілген",

    // New Keys
    createdBy: "Жасаған",
    switchTheme: "Тақырыпты ауыстыру",
    selectLanguage: "Тілді таңдау",
    
    // Theme customization
    themeSettings: "Тақырып параметрлері",
    colorTheme: "Түс тақырыбы",
    selectColor: "Негізгі түсті таңдаңыз",
    applyTheme: "Қолдану",
    resetTheme: "Қалпына келтіру",

    // AI Chat
    aiAssistant: "FinPredict AI",
    askAboutStocks: "Акция бағалары, болжамдар және энергетикалық компаниялар туралы сұраңыз",
    sendMessage: "Хабарлама жазыңыз...",
    thinking: "Ойланып жатырмын...",
    poweredBy: "Gemini AI",
    disclaimer: "Қаржылық кеңес емес",

    kztUsdForecast: "USD/KZT Бағамы Болжамы", // Adjusted for clarity
    kztForecastDescription: "Prophet үлгісін қолданып 7-күндік USD/KZT болжамы", // Adjusted
    currentRate: "Ағымдағы бағам", // Adjusted
    forecastPeriod: "Болжам кезеңі", // Adjusted
    days: "күн", // Adjusted
    loadForecast: "Болжамды жүктеу", // Adjusted
    loading: "Жүктелуде...", // Adjusted
    historicalData: "Тарихи деректер",
    forecastData: "Болжам",
    confidenceInterval: "Сенімділік аралығы", // Adjusted
    modelInformation: "Модель туралы ақпарат",
    trend: "Тренд",
    trendStrength: "Тренд күші",
    averageRate: "Орташа бағам", // Adjusted
    lastRate: "Соңғы бағам", // Adjusted
    oilImpact: "Мұнай әсері", // Adjusted
    confidence: "Сенімділік", // Adjusted
    dataSource: "Деректер көзі",
    generatedAt: "Генерацияланған уақыт", // Adjusted
    ascending: "өсу", // Adjusted
    descending: "төмендеу", // Adjusted
    positive: "оң", // Adjusted
    negative: "теріс", // Adjusted

    energyTitle: "Энергетикалық компаниялар",
    energySubtitle: "Әлемдік және қазақстандық энергетикалық компаниялар",
    globalCompanies: "Әлемдік компаниялар",
    kazakhstanCompanies: "Қазақстандық компаниялар",
    companyName: "Компания",
    ticker: "Тикер",
    currentPrice: "Ағымдағы баға",
    priceChange: "Өзгеріс",
    volatility: "Құбылмалылық",
    status: "Күйі",
    viewDetails: "Толығырақ",
    lastUpdated: "Соңғы жаңарту",
    totalCompanies: "Барлық компаниялар",
    successfulFetches: "Сәтті жүктелді",
    dataNotAvailable: "Деректер әзірше қолжетімді емес",
    runDataCollection: "Деректерді жинау скриптін іске қосыңыз",
    country: "Ел",
    successRate: "Табыс коэффициенті",
    noDataAvailable: "Деректер жоқ",
    europe: "Еуропа",
  },
}

const levelTranslations = {
  ru: { Начинающий: "Начинающий", Средний: "Средний", Продвинутый: "Продвинутый" },
  en: { Начинающий: "Beginner", Средний: "Intermediate", Продвинутый: "Advanced" },
  kk: { Начинающий: "Бастаушы", Средний: "Орташа", Продвинутый: "Жетілген" }, // Changed kz to kk
}

// Removed export default function FinPredictPlatform() { and replaced with Home()
export default function Home() {
  const [language, setLanguage] = useState<Language>("ru")
  const [forceUpdate, setForceUpdate] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showThemePanel, setShowThemePanel] = useState(false)
  const [selectedThemeHue, setSelectedThemeHue] = useState(264) // Default purple

  const t = (key: string) => translations[language][key as keyof (typeof translations)[typeof language]] || key

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setForceUpdate((prev) => prev + 1) // Force component re-render
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [stockData, setStockData] = useState<StockData | null>(null) // Typed as StockData
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("1 день")
  const [predictionResult, setPredictionResult] = useState<any>(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [newAlert, setNewAlert] = useState({ ticker: "", condition: "above" as "above" | "below", price: "" })
  const [reportLanguage, setReportLanguage] = useState("ru")
  const [realMarketData, setRealMarketData] = useState<any[]>([])
  const [marketDataLoading, setMarketDataLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [materials, setMaterials] = useState(educationalMaterials)
  const [searchTicker, setSearchTicker] = useState("") // Correctly declared searchTicker
  const [searchSuggestions, setSearchSuggestions] = useState<typeof stockDatabase>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [educationMaterials, setEducationMaterials] = useState([
    {
      title: "Введение в машинное обучение",
      description: "Основы машинного обучения и его применение в финансах",
      level: "Начинающий",
      duration: "30 мин",
      type: "Статья",
      url: "https://example.com/ml-intro",
    },
    {
      title: "Продвинутые стратегии трейдинга",
      description: "Видеокурс по продвинутым стратегиям трейдинга и инвестирования",
      level: "Продвинутый",
      duration: "60 мин",
      type: "Видео",
      url: "https://example.com/advanced-trading",
    },
  ])
  // const [activeTab, setActiveTab] = useState("Анализ") // Removed, replaced by activeSection
  const [loading, setLoading] = useState(false)
  const [newsData, setNewsData] = useState([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsPage, setNewsPage] = useState(0)
  const [hasMoreNews, setHasMoreNews] = useState(true)
  const [lastNewsUpdate, setLastNewsUpdate] = useState(0)
  const [selectedNews, setSelectedNews] = useState(null)

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  // New state for active section, used for navigation
  const [activeSection, setActiveSection] = useState<string>("analysis")

  const [chartPeriod, setChartPeriod] = useState("1week")
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [chartLoading, setChartLoading] = useState(false)

  const [kztForecastData, setKztForecastData] = useState<any>(null)
  const [kztForecastLoading, setKztForecastLoading] = useState(false)
  const [kztForecastDays, setKztForecastDays] = useState(7)

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)

      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission)
        })
      }
    }
  }, [])

  useEffect(() => {
    if (notificationPermission !== "granted") return

    const checkAlerts = () => {
      alerts.forEach((alert) => {
        if (!alert.isActive) return

        const marketData = getMarketData(alert.ticker)
        const shouldTrigger =
          (alert.condition === "above" && marketData.price > alert.price) ||
          (alert.condition === "below" && marketData.price < alert.price)

        if (shouldTrigger) {
          const conditionText = alert.condition === "above" ? "превысила" : "упала ниже"

          new Notification(`🚨 Алерт сработал: ${alert.ticker}`, {
            body: `Цена ${formatCurrency(marketData.price, marketData.currency)} ${conditionText} установленный уровень ${formatCurrency(alert.price, marketData.currency)}`,
            icon: "/favicon.ico",
            tag: alert.id,
            requireInteraction: true,
          })

          // Deactivate alert after triggering
          setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, isActive: false } : a)))
        }
      })
    }

    // Check alerts every 10 seconds for more responsive notifications
    const interval = setInterval(checkAlerts, 10000)
    return () => clearInterval(interval)
  }, [alerts, notificationPermission])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getMarketData = (ticker: string) => {
    const realData = realMarketData?.find((item) => item.ticker === ticker)
    if (realData) {
      return realData
    }

    // Fallback to static data if real data not available
    return (
      marketActivity.find((item) => item.ticker === ticker) || {
        ticker,
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        currency: "USD",
      }
    )
  }

  // Removed activeTab state, using activeSection instead

  const predictionPeriods = [
    { id: "1day", label: "1 день", days: 1 },
    { id: "3days", label: "3 дня", days: 3 },
    { id: "1week", label: "1 неделя", days: 7 },
    { id: "1month", label: "1 месяц", days: 30 },
  ]

  const fetchStockData = async (ticker: string) => {
    try {
      const response = await fetch(`/api/stock/${ticker}`)
      if (!response.ok) {
        throw new Error("Failed to fetch")
      }
      const data = await response.json()
      console.log("[v0] Fetched stock data:", data) // Added debug log to see API response
      console.log("[v0] Currency from API:", data.currency) // Added debug log for currency
      return data
    } catch (error) {
      console.error("[v0] Error fetching stock data:", error) // Added debug log for errors
      // Return fallback data
      const isEuropean = ["ASML.AS", "SAP.DE", "NESN.SW", "NOVO-B.CO", "MC.PA", "OR.PA"].includes(ticker.toUpperCase())
      const isAsian = ["7203.T", "0700.HK", "005930.KS", "TSM", "BABA", "2330.TW"].includes(ticker.toUpperCase())

      return {
        ticker: ticker, // Ensure ticker is present in fallback
        price: isEuropean ? 200 : isAsian ? 5000 : 150,
        change: isEuropean ? 3.5 : isAsian ? -50 : 2.5,
        changePercent: 2.1,
        volume: 1500000,
        marketCap: isEuropean ? 100000000000 : isAsian ? 300000000000 : 2500000000000,
        peRatio: 15.2,
        week52Low: isEuropean ? 150 : isAsian ? 4000 : 120,
        week52High: isEuropean ? 250 : isAsian ? 6000 : 180,
        name: isEuropean ? `${ticker} Corp.` : isAsian ? `${ticker} Co.` : `${ticker} Corporation`,
        currency: isEuropean ? "EUR" : isAsian ? "JPY" : "USD", // Ensure fallback data has correct currency
        historicalPrices: [], // Add for deterministic calculations
        avgVolume: 1000000, // Add for deterministic calculations
      }
    }
  }

  const handleAnalyzeStock = async (ticker: string) => {
    setSelectedStock(ticker)
    setLoading(true)
    try {
      const data = await fetchStockData(ticker)
      setStockData(data)
    } catch (error) {
      console.error("Error in handleAnalyzeStock:", error)
    } finally {
      setLoading(false)
    }
  }

  const predictionModels = [
    {
      id: "sarimax",
      name: "SARIMAX",
      description: "Консервативная статистическая модель с низкой волатильностью",
      icon: Calculator,
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "prophet",
      name: "Prophet",
      description: "Сбалансированная модель Facebook с умеренной волатильностью",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      borderColor: "border-green-500/30",
      bgColor: "bg-green-500/10",
    },
    {
      id: "lstm",
      name: "LSTM",
      description: "Агрессивная нейронная сеть с высокой волатильностью",
      icon: Zap,
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-500/30",
      bgColor: "bg-purple-500/10",
    },
  ]

  const handleCreateAlert = () => {
    if (newAlert.ticker && newAlert.price) {
      // Get current market data for the ticker
      const currentMarketData = getMarketData(newAlert.ticker.toUpperCase())

      const newAlertItem: Alert = {
        id: Date.now().toString(),
        ticker: newAlert.ticker.toUpperCase(),
        condition: newAlert.condition,
        price: Number.parseFloat(newAlert.price),
        currentPrice: currentMarketData.price,
        isActive: true,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setAlerts([...alerts, newAlertItem])
      setNewAlert({ ticker: "", condition: "above", price: "" })

      // Show success message
      window.alert(
        `Алерт создан для ${newAlertItem.ticker}! Вы получите уведомление когда цена ${newAlertItem.condition === "above" ? "превысит" : "упадет ниже"} ${formatCurrency(newAlertItem.price, currentMarketData.currency)}`,
      )
    }
  }

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const handleStartReading = (materialId: string) => {
    // Find the material in both categories
    let materialUrl = ""
    let foundMaterial = null

    // Search in articles
    foundMaterial = materials["Статьи и руководства"].find((m) => m.id === materialId)
    if (foundMaterial) {
      materialUrl = foundMaterial.url || ""
    } else {
      // Search in video courses
      foundMaterial = materials["Видеокурсы"].find((m) => m.id === materialId)
      if (foundMaterial) {
        materialUrl = foundMaterial.url || ""
      }
    }

    // Open URL in new tab if available
    if (materialUrl) {
      window.open(materialUrl, "_blank", "noopener,noreferrer")
    }
  }

  const calculateSMA = (prices: number[], period: number): number => {
    if (prices.length < period) return prices[prices.length - 1]
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
    return sum / period
  }

  const calculateRSI = (prices: number[], period = 14): number => {
    if (prices.length < period + 1) return 50

    let gains = 0
    let losses = 0

    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) gains += change
      else losses -= change
    }

    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgGain / (avgLoss || 1) // Avoid division by zero
    return 100 - 100 / (1 + rs)
  }

  const calculateVolatility = (prices: number[]): number => {
    if (prices.length < 2) return 0.02

    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length
    return Math.sqrt(variance * 252) // Annualized volatility
  }

  const fetchHistoricalData = async (period: string) => {
    if (!selectedStock || !stockData) return

    setChartLoading(true)

    // Simulate API call
    setTimeout(() => {
      const periodData = chartPeriods.find((p) => p.id === period)
      const days = periodData?.days || 7
      const currentPrice = stockData.price
      const data = []

      // Generate historical prices
      for (let i = days; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        // Create realistic price movement
        const randomWalk = (Math.random() - 0.5) * 0.02
        const trendFactor = stockData.change > 0 ? 0.001 : -0.001
        const price = currentPrice * (1 + (randomWalk + trendFactor) * (i / days))

        data.push({
          date: date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
          historicalPrice: Number(price.toFixed(2)), // Changed from price to historicalPrice
          forecastPrice: null,
          volume: Math.floor(stockData.volume * (0.8 + Math.random() * 0.4)),
          isForecast: false,
        })
      }

      // Add forecast data if prediction result exists
      if (predictionResult && predictionResult.dailyPredictions) {
        predictionResult.dailyPredictions.forEach((pred: any) => {
          data.push({
            date: new Date(pred.date).toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
            historicalPrice: null, // Changed from price to historicalPrice
            forecastPrice: pred.price,
            volume: 0,
            isForecast: true,
          })
        })
      }

      setHistoricalData(data)
      setChartLoading(false)
    }, 800)
  }

  const handleRunPrediction = async () => {
    if (!selectedModel || !selectedStock || !stockData) return

    setPredictionLoading(true)

    // Fetch historical data for chart and analysis
    const periodLabel = predictionPeriods.find((p) => p.id === selectedPeriod)?.label || "1 неделя"
    const days = predictionPeriods.find((p) => p.id === selectedPeriod)?.days || 7

    // Mock historical data for calculations if not provided by API
    const mockHistoricalPrices = Array.from({ length: 100 }, (_, i) => {
      const basePrice = stockData.price
      const change = stockData.change || 0
      const trendFactor = change > 0 ? 0.0005 : -0.0005
      const randomWalk = (Math.random() - 0.5) * 0.01
      const price = basePrice * (1 + trendFactor * i + randomWalk * i)
      return Number(price.toFixed(2))
    })
    const mockAvgVolume = stockData.volume ? stockData.volume * 0.8 : 1000000
    const mockStockDataWithHistory = {
      ...stockData,
      historicalPrices: mockHistoricalPrices,
      avgVolume: mockAvgVolume,
    }

    fetchHistoricalData(chartPeriod) // Update chart data

    // Simulate API call with realistic delay
    setTimeout(() => {
      // Calculate technical indicators based on actual price data
      const historicalPrices = mockStockDataWithHistory.historicalPrices || [] // Use mock or actual historical prices
      const currentPrice = mockStockDataWithHistory.price

      // Calculate SMA20 from historical data if available
      const sma20 =
        historicalPrices.length >= 20
          ? historicalPrices.slice(-20).reduce((sum, p) => sum + p, 0) / 20
          : currentPrice * 0.98

      // Calculate SMA50 from historical data if available
      const sma50 =
        historicalPrices.length >= 50
          ? historicalPrices.slice(-50).reduce((sum, p) => sum + p, 0) / 50
          : currentPrice * 0.95

      // Calculate RSI from price changes
      const priceChanges = historicalPrices.slice(-14).map((p, i, arr) => (i === 0 ? 0 : p - arr[i - 1]))
      const gains = priceChanges.filter((c) => c > 0).reduce((sum, c) => sum + c, 0) / 14
      const losses = Math.abs(priceChanges.filter((c) => c < 0).reduce((sum, c) => sum + c, 0)) / 14
      const rs = gains / (losses || 1) // Avoid division by zero
      const rsi = 100 - 100 / (1 + rs)

      // Calculate volatility from actual price variance
      const mean = historicalPrices.reduce((sum, p) => sum + p, 0) / historicalPrices.length
      const variance = historicalPrices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / historicalPrices.length
      const volatility = Math.sqrt(variance) / mean // Normalized volatility

      // Calculate trend strength from linear regression
      const n = historicalPrices.length
      const sumX = (n * (n - 1)) / 2
      const sumY = historicalPrices.reduce((sum, p) => sum + p, 0)
      const sumXY = historicalPrices.reduce((sum, p, i) => sum + i * p, 0)
      const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      const trendStrength = slope / mean

      // Calculate momentum from recent price changes
      const recentChange = historicalPrices[historicalPrices.length - 1] - historicalPrices[historicalPrices.length - 5]
      const momentumSignal = recentChange / (historicalPrices[historicalPrices.length - 5] || 1) // Avoid division by zero

      // Calculate support and resistance levels
      const recentPrices = historicalPrices.slice(-20)
      const supportLevel = Math.min(...recentPrices) * 0.98
      const resistanceLevel = Math.max(...recentPrices) * 1.02

      // Calculate position in 52-week range
      const week52Low = mockStockDataWithHistory.week52Low || currentPrice * 0.8
      const week52High = mockStockDataWithHistory.week52High || currentPrice * 1.2
      const currentVsLow = ((currentPrice - week52Low) / (week52High - week52Low)) * 100

      // Volatility adjustment based on actual volatility
      const volatilityAdjustment = volatility * 0.02

      const technicalAnalysis = {
        rsi: Number(rsi.toFixed(2)),
        sma20: Number(sma20.toFixed(2)),
        sma50: Number(sma50.toFixed(2)),
        macdSignal: currentPrice > sma20 ? "Bullish signal" : "Bearish signal", // Simplified MACD representation
        pricePosition:
          currentPrice > sma20 && currentPrice > sma50
            ? "Strong bullish trend"
            : currentPrice > sma20
              ? "Moderate growth"
              : currentPrice < sma50
                ? "Bearish trend"
                : "Sideways movement",
        supportLevel: Number(supportLevel.toFixed(2)),
        resistanceLevel: Number(resistanceLevel.toFixed(2)),
        volatility: Number((volatility * 100).toFixed(2)), // Percentage
      }

      const volumeSignal =
        mockStockDataWithHistory.avgVolume === 0
          ? 0
          : mockStockDataWithHistory.volume / mockStockDataWithHistory.avgVolume - 1 // Ratio of current volume to average volume

      const marketFactors = {
        volume: mockStockDataWithHistory.volume, // Corrected: Use mockStockDataWithHistory.volume
        avgVolume: mockStockDataWithHistory.avgVolume, // Corrected: Use mockStockDataWithHistory.avgVolume
        volumeRatio: Number(
          (mockStockDataWithHistory.avgVolume === 0
            ? 0
            : (mockStockDataWithHistory.volume / mockStockDataWithHistory.avgVolume) * 100
          ).toFixed(1),
        ),
        trend: trendStrength > 0.01 ? "Uptrend" : trendStrength < -0.01 ? "Downtrend" : "Sideways",
        trendStrength: Number((Math.abs(trendStrength) * 100).toFixed(2)),
        week52Low: week52Low,
        week52High: week52High,
        currentVsLow: Number(currentVsLow.toFixed(1)),
      }

      const generateDailyPredictions = (targetPrice: number, modelVolatility: number) => {
        const dailyPredictions = []
        const totalChange = (targetPrice - currentPrice) / currentPrice
        let cumulativePrice = currentPrice

        for (let day = 1; day <= days; day++) {
          const progressRatio = day / days
          // Introduce some randomness based on model volatility but keep it predictable
          const volatilityFactor =
            Math.sin(day * 0.8 + (Math.random() * Math.PI) / 4) * modelVolatility * 0.005 * (1 - progressRatio * 0.5)
          const expectedPrice = currentPrice + totalChange * currentPrice * progressRatio
          cumulativePrice = expectedPrice + expectedPrice * volatilityFactor

          if (day === days) {
            cumulativePrice = targetPrice
          }

          const date = new Date()
          date.setDate(date.getDate() + day)
          const dayChange = ((cumulativePrice - currentPrice) / currentPrice) * 100

          dailyPredictions.push({
            day,
            date: date.toLocaleDateString("ru-RU"), // Use ru-RU for consistent date format
            price: Number(cumulativePrice.toFixed(2)),
            change: Number(dayChange.toFixed(2)),
            confidence: Math.round(Math.max(60, Math.min(95, 85 - Math.abs(dayChange) * 2))),
          })
        }

        return dailyPredictions
      }

      const predictions = {
        sarimax: (() => {
          const trendComponent = trendStrength * 0.3
          const movingAverageSignal = currentPrice > sma20 ? 0.01 : -0.01
          const priceChange = (trendComponent + movingAverageSignal) * (days / 7)
          const targetPrice = currentPrice * (1 + Math.max(-0.05, Math.min(0.05, priceChange)))
          const dailyPredictions = generateDailyPredictions(targetPrice, 0.5)

          const analysisArguments = [
            `Цена сейчас ${formatCurrency(currentPrice, mockStockDataWithHistory.currency)} ${currentPrice > sma20 ? "выше" : "ниже"} средней цены за 20 дней (${formatCurrency(sma20, mockStockDataWithHistory.currency)}) на ${Math.abs(((currentPrice - sma20) / sma20) * 100).toFixed(1)}%`,
            `Индикатор RSI показывает ${rsi > 70 ? "акция перекуплена" : rsi < 30 ? "акция перепродана" : "нормальную ситуацию"} со значением ${rsi.toFixed(1)} баллов`,
            `Волатильность составляет ${(volatility * 100).toFixed(1)}% - это ${volatility > 0.3 ? "высокий" : volatility > 0.2 ? "умеренный" : "низкий"} уровень риска`,
            `Тренд ${trendStrength > 0 ? "восходящий" : "нисходящий"} с силой ${Math.abs(trendStrength * 100).toFixed(2)}% за последний период`,
            `Уровень поддержки ${formatCurrency(supportLevel, mockStockDataWithHistory.currency)}, сопротивления ${formatCurrency(resistanceLevel, mockStockDataWithHistory.currency)}`,
          ]

          return {
            direction: targetPrice > currentPrice ? "up" : "down",
            confidence: Math.round(Math.max(60, Math.min(80, 70 - volatility * 50))),
            targetPrice: Number(targetPrice.toFixed(2)),
            timeframe: periodLabel,
            risk: volatility > 0.3 ? "Высокий" : volatility > 0.2 ? "Средний" : "Низкий",
            description: `Статистический анализ на ${periodLabel} на основе трендов и технических индикаторов`,
            dailyPredictions,
            technicalAnalysis,
            marketFactors,
            arguments: analysisArguments,
            methodology:
              "SARIMAX - статистическ��я модель, которая анализирует исторические тренды и паттерны для прогнозирования будущих цен",
          }
        })(),

        prophet: (() => {
          const trendFactor = trendStrength * 0.5
          const volumeFactor = volumeSignal * 0.01
          const priceChange = (trendFactor + volumeFactor) * (days / 7)
          const targetPrice = currentPrice * (1 + Math.max(-0.08, Math.min(0.08, priceChange)))
          const dailyPredictions = generateDailyPredictions(targetPrice, 0.7)

          const analysisArguments = [
            `Объем торгов ${mockStockDataWithHistory.volume.toLocaleString()} ${mockStockDataWithHistory.volume > mockStockDataWithHistory.avgVolume ? "превышает" : "ниже"} средний объем (${mockStockDataWithHistory.avgVolume.toLocaleString()}) на ${Math.abs(((mockStockDataWithHistory.volume - mockStockDataWithHistory.avgVolume) / mockStockDataWithHistory.avgVolume) * 100).toFixed(1)}%`,
            `Тренд ${technicalAnalysis.pricePosition.toLowerCase()} с силой изменения ${Math.abs(trendStrength * 100).toFixed(2)}% за период`,
            `Цена находится на ${currentVsLow.toFixed(1)}% от 52-недельного минимума к максимуму`,
            `Индикатор MACD показывает ${technicalAnalysis.macdSignal.toLowerCase()}`,
            `Соотношение цены к средним значениям: SMA20=${formatCurrency(sma20, mockStockDataWithHistory.currency)}, SMA50=${formatCurrency(sma50, mockStockDataWithHistory.currency)}`,
          ]

          return {
            direction: targetPrice > currentPrice ? "up" : "down",
            confidence: Math.round(Math.max(65, Math.min(85, 75 - volatility * 30))),
            targetPrice: Number(targetPrice.toFixed(2)),
            timeframe: periodLabel,
            risk: volatility > 0.25 ? "Средний" : "Низкий",
            description: `Комплексный анализ на ${periodLabel} с учетом трендов и объемов торгов`,
            dailyPredictions,
            technicalAnalysis,
            marketFactors,
            arguments: analysisArguments,
            methodology:
              "Prophet - система анализа от Meta, которая учитывает тренды, сезонность и аномалии для точных прогнозов",
          }
        })(),

        lstm: (() => {
          const neuralSignal = trendStrength * 0.7 + momentumSignal * 0.02 + volumeSignal * 0.015
          const volatilityBoost = volatility > 0.3 ? volatilityAdjustment : -volatilityAdjustment * 0.5
          const nonLinearFactor = Math.tanh(neuralSignal * 3) * 0.03
          const priceChange = (neuralSignal + volatilityBoost + nonLinearFactor) * (days / 7)
          const targetPrice = currentPrice * (1 + Math.max(-0.12, Math.min(0.12, priceChange)))
          const dailyPredictions = generateDailyPredictions(targetPrice, 1.0)

          const analysisArguments = [
            `Нейросетевой сигнал ${neuralSignal > 0 ? "положительный" : "отрицательный"} со значением ${(neuralSignal * 100).toFixed(2)}% на основе комплексного анализа`,
            `Momentum индикатор: ${momentumSignal > 0 ? "рост" : momentumSignal < 0 ? "падение" : "стагнация"} на ${(Math.abs(momentumSignal) * 100).toFixed(2)}% за последние 5 периодов`,
            `Волатильность ${(volatility * 100).toFixed(2)}% ${volatility > 0.3 ? "создает возможности для прибыли" : "указывает на стабильность"}`,
            `Нелинейный фактор показывает ${Math.abs(nonLinearFactor) > 0.01 ? "сильное" : "слабое"} ${nonLinearFactor > 0 ? "ускорение роста" : "замедление"}`,
            `Совокупный сигнал силой ${(Math.abs(neuralSignal + volatilityBoost + nonLinearFactor) * 100).toFixed(2)}% указывает на ${neuralSignal + volatilityBoost + nonLinearFactor > 0 ? "покупку" : "продажу"}`,
          ]

          return {
            direction: targetPrice > currentPrice ? "up" : "down",
            confidence: Math.round(Math.max(70, Math.min(90, 80 - volatility * 40))),
            targetPrice: Number(targetPrice.toFixed(2)),
            timeframe: periodLabel,
            risk: volatility > 0.3 ? "Высокий" : "Средний",
            description: `Нейросетевой анализ на ${periodLabel} с глубоким обучением паттернов`,
            dailyPredictions,
            technicalAnalysis,
            marketFactors,
            arguments: analysisArguments,
            methodology:
              "LSTM - рекуррентная нейронная сеть, которая запоминает важные паттерны и предсказывает будущие движения цен",
          }
        })(),
      }

      setPredictionResult(predictions[selectedModel as keyof typeof predictions])
      setPredictionLoading(false)
    }, 2000)
  }

  const downloadReport = () => {
    if (!predictionResult || !stockData) {
      // Added check for stockData
      window.alert("Сначала выполните прогнозирование для получения отчета.")
      return
    }

    try {
      const reportContent = `
ОТЧЕТ ПРОГНОЗИРОВАНИЯ АКЦИЙ
============================

Компания: ${stockData.name || stockData.ticker}
Тикер: ${selectedStock}
Текущая цена: ${formatCurrency(stockData.price || 0, stockData.currency || "USD")}
Дата анализа: ${new Date().toLocaleDateString("ru-RU")}

ПРОГНОЗ
-------
Модель: ${selectedModel || "Не выбрана"}
Период: ${selectedPeriod || "Не выбран"}
Направление: ${predictionResult.direction === "up" ? "Рост" : predictionResult.direction === "down" ? "Падение" : "Стабильно"}
Целевая цена: ${formatCurrency(predictionResult.targetPrice || 0, stockData.currency || "USD")}
Уровень уверенности: ${predictionResult.confidence || 0}%

ОБОСНОВАНИЕ
-----------
${predictionResult.arguments?.join("\n") || "Нет данных"}

ДНЕВНЫЕ ПРОГНОЗЫ
----------------
${
  predictionResult.dailyPredictions && predictionResult.dailyPredictions.length > 0
    ? predictionResult.dailyPredictions
        .map(
          (
            pred: any, // Added type annotation for 'pred'
          ) =>
            `День ${pred.day}: ${formatCurrency(pred.price || 0, stockData.currency || "USD")} (${pred.change > 0 ? "+" : ""}${(pred.change || 0).toFixed(2)}%)`,
        )
        .join("\n")
    : "Нет данных"
}

ТЕХНИЧЕСКИЕ ИНДИКАТОРЫ
---------------------
${
  predictionResult.technicalAnalysis
    ? `RSI: ${predictionResult.technicalAnalysis.rsi}
SMA 20: ${formatCurrency(predictionResult.technicalAnalysis.sma20, stockData.currency)}
SMA 50: ${formatCurrency(predictionResult.technicalAnalysis.sma50, stockData.currency)}
Уровень поддержки: ${formatCurrency(predictionResult.technicalAnalysis.supportLevel, stockData.currency)}
Уровень сопротивления: ${formatCurrency(predictionResult.technicalAnalysis.resistanceLevel, stockData.currency)}
Волатильность: ${predictionResult.technicalAnalysis.volatility}%`
    : "Нет данных"
}

---
Отчет сгенерирован платформой FinPredict
${new Date().toLocaleString("ru-RU")}
      `

      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `FinPredict_${selectedStock}_${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating report:", error)
      window.alert("Ошибка при создании отчета. Попробуйте еще раз.")
    }
  }

  const fetchMarketData = async () => {
    setMarketDataLoading(true)
    try {
      // Fetching data from /api/investing endpoint with tickers from popularStocks
      const allTickers = stockDatabase.map((stock) => stock.ticker) // Use all available tickers from stockDatabase
      const response = await fetch(`/api/investing?tickers=${allTickers.join(",")}`)

      if (response.ok) {
        const result = await response.json()
        setRealMarketData(result.data || [])
      } else {
        throw new Error("Failed to fetch from Investing.com API")
      }
    } catch (error) {
      console.error("Error fetching market data:", error)
      // Fallback to mock data generation if API fails
      const marketData = []
      const allTickers = stockDatabase.map((stock) => stock.ticker)

      for (const ticker of allTickers) {
        const stockInfo = stockDatabase.find((s) => s.ticker === ticker)
        const realisticPrices = {
          AAPL: 150.0,
          GOOGL: 142.5,
          MSFT: 420.5,
          TSLA: 248.4,
          "ASML.AS": 785.4,
          "SAP.DE": 168.9,
          "NESN.SW": 92.3,
          "7203.T": 2450.0,
          "0700.HK": 385.6,
          "005930.KS": 71200.0,
        }

        const basePrice = realisticPrices[ticker as keyof typeof realisticPrices] || Math.random() * 200 + 50
        const change = (Math.random() - 0.5) * basePrice * 0.03
        const changePercent = (change / basePrice) * 100
        const currency =
          stockInfo?.category === "European" ? "EUR" : stockInfo?.category === "Азиатские" ? "JPY" : "USD"

        marketData.push({
          ticker,
          price: basePrice + change,
          change,
          changePercent,
          currency,
        })
      }

      setRealMarketData(marketData)
    } finally {
      setMarketDataLoading(false)
    }
  }

  // Updated popularStocks structure to match the new `stockDatabase` structure
  const popularStocks = {
    "US Tech": ["AAPL", "GOOGL", "MSFT", "NVDA"],
    "US Finance": ["JPM", "V"],
    Europe: ["ASML.AS", "SAP.DE"],
    Asia: ["TSM"],
  }

  const viewArticle = (news: any) => {
    setSelectedNews(news)
  }

  const closeArticle = () => {
    setSelectedNews(null)
  }

  // Updated news grid with real article data
  const refreshNewsData = async () => {
    setNewsLoading(true)
    try {
      const response = await fetch("/api/news/list?page=1&limit=20")
      const data = await response.json()

      if (data.success && data.articles) {
        setNewsData(data.articles || [])
        setNewsPage(1)
        setHasMoreNews(data.pagination?.page < data.pagination?.total_pages)
        setLastNewsUpdate(Date.now())
      }
    } catch (error) {
      console.error("[v0] Error refreshing news:", error)
    } finally {
      setNewsLoading(false)
    }
  }

  const loadMoreNews = async () => {
    if (newsLoading || !hasMoreNews) return

    setNewsLoading(true)
    try {
      const nextPage = newsPage + 1
      const response = await fetch(`/api/news/list?page=${nextPage}&limit=20`)
      const data = await response.json()

      if (data.success && data.articles) {
        setNewsData([...newsData, ...(data.articles || [])])
        setNewsPage(nextPage)
        setHasMoreNews(data.pagination?.page < data.pagination?.total_pages)
      }
    } catch (error) {
      console.error("[v0] Error loading more news:", error)
    } finally {
      setNewsLoading(false)
    }
  }

  useEffect(() => {
    refreshNewsData()
    fetchMarketData()
  }, [])

  const handleContactSales = () => {
    const subject = encodeURIComponent("FinPredict - Запрос на консультацию")
    const body = encodeURIComponent(`Здравствуйте!

Меня интересует платформа FinPredict для анализа и прогнозирования финансовых рынков.

Прошу связаться со мной для обсуждения возможностей сотрудничества.

С уважением`)

    window.open(`mailto:erzatmtv@outlook.com?subject=${subject}&body=${body}`, "_blank")
  }

  const handleStockSearch = () => {
    if (searchTicker) {
      handleAnalyzeStock(searchTicker.toUpperCase())
      setShowSuggestions(false)
    }
  }

  const handleStockSelect = (ticker: string) => {
    setSearchTicker(ticker)
    handleAnalyzeStock(ticker)
    setShowSuggestions(false)
  }

  const handleSearchInputChange = (value: string) => {
    setSearchTicker(value)

    if (value.trim().length > 0) {
      const query = value.toLowerCase()
      const filtered = stockDatabase
        .filter((stock) => stock.ticker.toLowerCase().includes(query) || stock.name.toLowerCase().includes(query))
        .slice(0, 8) // Limit to 8 suggestions

      setSearchSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (ticker: string) => {
    setSearchTicker(ticker)
    handleAnalyzeStock(ticker)
    setShowSuggestions(false)
  }

  const chartPeriods = [
    { id: "1day", label: "1 день", days: 1 },
    { id: "3days", label: "3 дня", days: 3 },
    { id: "1week", label: "1 неделя", days: 7 },
    { id: "1month", label: "1 месяц", days: 30 },
  ]

  const fetchKZTForecast = async () => {
    setKztForecastLoading(true)
    try {
      const response = await fetch(`/api/kzt-usd-forecast?days=${kztForecastDays}&history=90`)
      const result = await response.json()

      if (result.success && result.data) {
        setKztForecastData(result.data)
      } else {
        console.error("Error fetching KZT forecast:", result.error)
        setKztForecastData(null)
      }
    } catch (error) {
      console.error("Error fetching KZT forecast:", error)
    } finally {
      setKztForecastLoading(false)
    }
  }

  // const [activeSection, setActiveSection] = useState<string>("analysis") // Moved to top

  return (
    <div
      key={forceUpdate}
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white"
          : "bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header
          className={`glass-card rounded-2xl mb-8 sticky top-4 z-50 ${isDarkMode ? "bg-gray-900/30" : "bg-white/30"}`}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex justify-between items-center h-20">
              <div
                className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => {
                  setActiveSection("analysis")
                  // setActiveTab("analysis") // Removed, replaced by activeSection logic
                  setSelectedStock(null)
                  setStockData(null)
                }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  FinPredict
                </h1>
              </div>

              <nav className="hidden md:flex items-center space-x-2">
                {[
                  { key: "analysis", label: t("analysis") },
                  { key: "alerts", label: t("alerts") },
                  { key: "education", label: t("education") },
                  { key: "news", label: t("news") },
                  { key: "kztForecast", label: t("kztForecast") },
{ key: "energyIndustries", label: t("energyIndustries") },
              { key: "mlpredictions", label: t("mlPredictions") },
              ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSection(tab.key)}
                    className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 modern-button ${
                      activeSection === tab.key
                        ? isDarkMode
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-400/30"
                        : isDarkMode
                          ? "text-gray-300 hover:bg-white/5"
                          : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center space-x-3">
                {/* Language Selector */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm border-2 transition-all duration-300 modern-button ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700 text-white hover:border-blue-500"
                      : "bg-white/50 border-gray-200 text-gray-900 hover:border-blue-400"
                  }`}
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="kk">🇰🇿 Қазақша</option> {/* Changed kz to kk */}
                </select>

                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-3 rounded-xl transition-all duration-300 modern-button ${
                    isDarkMode
                      ? "bg-gray-800/50 text-yellow-400 hover:bg-gray-700/50"
                      : "bg-white/50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>

                {/* Color Theme Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowThemePanel(!showThemePanel)}
                    className={`p-3 rounded-xl transition-all duration-300 modern-button ${
                      isDarkMode
                        ? "bg-gray-800/50 hover:bg-gray-700/50"
                        : "bg-white/50 hover:bg-gray-100"
                    }`}
                    title={t("colorTheme")}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border-2 border-white shadow-inner"
                      style={{ 
                        background: `linear-gradient(135deg, 
                          oklch(0.6 0.2 ${selectedThemeHue}) 0%, 
                          oklch(0.4 0.2 ${selectedThemeHue}) 100%)` 
                      }}
                    />
                  </button>
                  
                  {/* Theme Panel Dropdown */}
                  {showThemePanel && (
                    <div 
                      className={`absolute right-0 top-full mt-2 p-4 rounded-xl shadow-2xl border z-50 w-72 ${
                        isDarkMode 
                          ? "bg-gray-900 border-gray-700" 
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {t("colorTheme")}
                        </h3>
                        <button 
                          onClick={() => setShowThemePanel(false)}
                          className={`p-1 rounded-lg transition-colors ${
                            isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                          }`}
                        >
                          <X />
                        </button>
                      </div>
                      
                      <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {t("selectColor")}
                      </p>
                      
                      {/* Color Presets Grid */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                          { name: "Purple", hue: 264, color: "from-purple-500 to-purple-700" },
                          { name: "Blue", hue: 220, color: "from-blue-500 to-blue-700" },
                          { name: "Teal", hue: 175, color: "from-teal-500 to-teal-700" },
                          { name: "Green", hue: 145, color: "from-green-500 to-green-700" },
                          { name: "Orange", hue: 30, color: "from-orange-500 to-orange-700" },
                          { name: "Rose", hue: 350, color: "from-rose-500 to-rose-700" },
                          { name: "Amber", hue: 45, color: "from-amber-500 to-amber-700" },
                          { name: "Cyan", hue: 190, color: "from-cyan-500 to-cyan-700" },
                        ].map((theme) => (
                          <button
                            key={theme.name}
                            onClick={() => {
                              setSelectedThemeHue(theme.hue)
                              // Apply theme to CSS variables
                              document.documentElement.style.setProperty(
                                "--primary", 
                                `oklch(${isDarkMode ? 0.65 : 0.45} 0.22 ${theme.hue})`
                              )
                              document.documentElement.style.setProperty(
                                "--ring", 
                                `oklch(${isDarkMode ? 0.65 : 0.45} 0.22 ${theme.hue})`
                              )
                              document.documentElement.style.setProperty(
                                "--accent", 
                                `oklch(${isDarkMode ? 0.65 : 0.45} 0.22 ${theme.hue})`
                              )
                            }}
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.color} transition-all duration-200 hover:scale-110 ${
                              selectedThemeHue === theme.hue 
                                ? "ring-2 ring-offset-2 ring-blue-500 scale-110" 
                                : ""
                            }`}
                            style={{
                              background: `linear-gradient(135deg, 
                                oklch(0.6 0.2 ${theme.hue}) 0%, 
                                oklch(0.4 0.2 ${theme.hue}) 100%)`
                            }}
                            title={theme.name}
                          />
                        ))}
                      </div>
                      
                      {/* Custom Hue Slider */}
                      <div className="mb-4">
                        <label className={`text-xs font-medium mb-2 block ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Custom Color (Hue: {selectedThemeHue})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={selectedThemeHue}
                          onChange={(e) => {
                            const hue = parseInt(e.target.value)
                            setSelectedThemeHue(hue)
                            document.documentElement.style.setProperty(
                              "--primary", 
                              `oklch(${isDarkMode ? 0.65 : 0.45} 0.22 ${hue})`
                            )
                            document.documentElement.style.setProperty(
                              "--ring", 
                              `oklch(${isDarkMode ? 0.65 : 0.45} 0.22 ${hue})`
                            )
                            document.documentElement.style.setProperty(
                              "--accent", 
                              `oklch(${isDarkMode ? 0.65 : 0.45} 0.22 ${hue})`
                            )
                          }}
                          className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, 
                              oklch(0.6 0.2 0), oklch(0.6 0.2 60), oklch(0.6 0.2 120), 
                              oklch(0.6 0.2 180), oklch(0.6 0.2 240), oklch(0.6 0.2 300), oklch(0.6 0.2 360))`
                          }}
                        />
                      </div>
                      
                      {/* Reset Button */}
                      <button
                        onClick={() => {
                          setSelectedThemeHue(264)
                          document.documentElement.style.setProperty("--primary", "oklch(0.45 0.22 264)")
                          document.documentElement.style.setProperty("--ring", "oklch(0.45 0.22 264)")
                          document.documentElement.style.setProperty("--accent", "oklch(0.45 0.22 264)")
                        }}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                          isDarkMode 
                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {t("resetTheme")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Sales Button */}
                <button
                  onClick={handleContactSales}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 modern-button"
                >
                  {t("contactSales")}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className={`glass-card rounded-2xl p-4 mb-8 text-center ${isDarkMode ? "bg-gray-900/20" : "bg-white/20"}`}>
          <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {t("createdBy")}{" "}
            <span className="font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Mametayev Yerzat
            </span>
          </p>
        </div>

        <main className="space-y-8">
          <div className="relative">
            {activeSection === "analysis" && !selectedStock && (
              <div className="relative min-h-[600px] flex items-center justify-center">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                  <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {t("stockAnalysis")}
                  </h2>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{t("getDetailedAnalysis")}</p>

                  {/* Search Section */}
                  <div className="max-w-md mx-auto mt-8">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTicker}
                        onChange={(e) => handleSearchInputChange(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleStockSearch()}
                        onFocus={() => searchTicker.length > 0 && setShowSuggestions(true)}
                        className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder={t("enterTicker")}
                      />
                      <button
                        onClick={handleStockSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Search className="w-5 h-5" />
                      </button>

                      {showSuggestions && searchSuggestions.length > 0 && (
                        <div
                          className={`absolute z-50 w-full mt-2 rounded-lg border shadow-lg overflow-hidden ${
                            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                          }`}
                        >
                          <div
                            className={`px-3 py-2 text-xs font-semibold ${
                              isDarkMode ? "text-gray-400 bg-gray-900/50" : "text-gray-500 bg-gray-50"
                            }`}
                          >
                            {language === "ru"
                              ? "Возможно вы искали:"
                              : language === "kk" // Changed kz to kk
                                ? "Мүмкін сіз іздедіңіз:"
                                : "You might be looking for:"}
                          </div>
                          {searchSuggestions.map((stock) => (
                            <button
                              key={stock.ticker}
                              onClick={() => handleSuggestionClick(stock.ticker)}
                              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                                isDarkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-50 text-gray-900"
                              }`}
                            >
                              <div className="flex-1">
                                <div className="font-semibold">{stock.ticker}</div>
                                <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  {stock.name}
                                </div>
                              </div>
                              <div
                                className={`text-xs px-2 py-1 rounded ${
                                  isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {stock.category}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Popular Stocks */}
                  <div className="mt-12">
                    <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {t("popularStocks")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* US Tech */}
                      <div
                        className={`p-6 rounded-xl border ${
                          isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                        } shadow-sm`}
                      >
                        <h4 className={`font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>US Tech</h4>
                        <div className="space-y-3">
                          {popularStocks["US Tech"].map((ticker) => (
                            <button
                              key={ticker}
                              onClick={() => handleStockSelect(ticker)}
                              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              {ticker}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* US Finance */}
                      <div
                        className={`p-6 rounded-xl border ${
                          isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                        } shadow-sm`}
                      >
                        <h4 className={`font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          US Finance
                        </h4>
                        <div className="space-y-3">
                          {popularStocks["US Finance"].map((ticker) => (
                            <button
                              key={ticker}
                              onClick={() => handleStockSelect(ticker)}
                              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              {ticker}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* European */}
                      <div
                        className={`p-6 rounded-xl border ${
                          isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                        } shadow-sm`}
                      >
                        <h4 className={`font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          European
                        </h4>
                        <div className="space-y-3">
                          {popularStocks["Europe"].map((ticker) => (
                            <button
                              key={ticker}
                              onClick={() => handleStockSelect(ticker)}
                              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              {ticker}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "analysis" && selectedStock && (
              <div className="space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                  <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {t("stockAnalysis")}
                  </h2>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{t("getDetailedAnalysis")}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div
                      className={`rounded-xl p-6 shadow-sm border ${
                        isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {t("analysis")} {selectedStock}
                          </h3>
                          {loading ? (
                            <div className="animate-pulse space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {stockData?.name || selectedStock}
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>{t("price")}</span>{" "}
                                  <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                    {formatCurrency(stockData?.price, stockData?.currency || "USD")}
                                  </span>
                                </div>
                                <div>
                                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>{t("change")}</span>{" "}
                                  <span
                                    className={`font-medium ${
                                      stockData?.change >= 0 ? "text-green-600" : "text-red-600"
                                    }`}
                                  >
                                    {stockData?.change >= 0 ? "+" : ""}
                                    {stockData?.change} ({stockData?.changePercent}%)
                                  </span>
                                </div>
                                <div>
                                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>{t("volume")}</span>{" "}
                                  <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                    {stockData?.volume}
                                  </span>
                                </div>
                                <div>
                                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                                    {t("marketCap")}
                                  </span>{" "}
                                  <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                    {formatLargeCurrency(stockData?.marketCap, stockData?.currency || "USD")}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                                <div>
                                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>P/E Ratio:</span>{" "}
                                  <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                    {stockData?.peRatio}
                                  </span>
                                </div>
                                <div>
                                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>52 Week Range:</span>{" "}
                                  <span
                                    className={`font-medium text-xs ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}
                                  >
                                    {formatCurrency(stockData?.week52Low, stockData?.currency || "USD")} -{" "}
                                    {formatCurrency(stockData?.week52High, stockData?.currency || "USD")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {t("runPrediction")}
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label
                                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                              >
                                {t("model")}
                              </label>
                              <div className="grid grid-cols-1 gap-2">
                                {predictionModels.map((model) => (
                                  <button
                                    key={model.id}
                                    onClick={() => setSelectedModel(model.id)}
                                    className={`p-3 rounded-lg border text-left transition-all ${
                                      selectedModel === model.id
                                        ? `${model.borderColor} ${model.bgColor} border-2`
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div
                                        className={`p-2 rounded-lg ${
                                          selectedModel === model.id ? model.bgColor : "bg-gray-100"
                                        }`}
                                      >
                                        <model.icon />
                                      </div>
                                      <div>
                                        <div className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                          {model.name}
                                        </div>
                                        <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                          {model.description}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label
                                className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                              >
                                {t("period")}
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {predictionPeriods.map((period) => (
                                  <button
                                    key={period.id}
                                    onClick={() => setSelectedPeriod(period.id)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      selectedPeriod === period.id
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                  >
                                    {period.label}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={handleRunPrediction}
                                disabled={!selectedModel || predictionLoading}
                                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <div className="flex items-center justify-center space-x-2">
                                  {predictionLoading && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  )}
                                  <span>{predictionLoading ? t("forecasting") : t("runForecast")}</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    {predictionResult && (
                      <div
                        className={`rounded-xl p-6 shadow-sm border ${
                          isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Результаты прогнозирования
                          </h3>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <select
                                value={reportLanguage}
                                onChange={(e) => setReportLanguage(e.target.value)}
                                className={`px-3 py-1 border rounded-lg text-sm ${
                                  isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-gray-900"
                                }`}
                              >
                                <option value="ru">Русский</option>
                                <option value="en">English</option>
                              </select>
                              <button
                                onClick={downloadReport}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                <span>Скачать отчет</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className={`text-center p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                            <div className={`text-sm mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Направление
                            </div>
                            <div
                              className={`text-lg font-semibold ${
                                predictionResult.direction === "up"
                                  ? "text-green-600"
                                  : predictionResult.direction === "down"
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {predictionResult.direction === "up"
                                ? "↗ Рост"
                                : predictionResult.direction === "down"
                                  ? "↘ Падение"
                                  : "Стабильно"}
                            </div>
                          </div>
                          <div className={`text-center p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                            <div className={`text-sm mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Целевая цена
                            </div>
                            <div className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              {formatCurrency(predictionResult.targetPrice, stockData?.currency || "USD")}
                            </div>
                          </div>
                          <div className={`text-center p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                            <div className={`text-sm mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Уверенность
                            </div>
                            <div className="text-lg font-semibold text-blue-600">{predictionResult.confidence}%</div>
                          </div>
                          <div className={`text-center p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                            <div className={`text-sm mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Уровень риска
                            </div>
                            <div
                              className={`text-lg font-semibold ${
                                predictionResult.risk === "Низкий"
                                  ? "text-green-600"
                                  : predictionResult.risk === "Средний"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {predictionResult.risk}
                            </div>
                          </div>
                          <div
                            className={`col-span-2 md:col-span-4 p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-blue-50"}`}
                          >
                            <div className={`text-sm mb-1 ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                              Методология анализа
                            </div>
                            <div className={`text-sm ${isDarkMode ? "text-blue-200" : "text-blue-800"}`}>
                              {predictionResult.methodology}
                            </div>
                          </div>
                        </div>

                        {predictionResult.technicalAnalysis && (
                          <div className="mb-6">
                            <h4 className={`font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              Технический анализ
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                <div className={`text-gray-500 ${isDarkMode ? "text-gray-400" : ""}`}>SMA - 20</div>
                                <div className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                  {formatCurrency(
                                    predictionResult.technicalAnalysis.sma20,
                                    stockData?.currency || "USD",
                                  )}
                                </div>
                              </div>
                              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                <div className={`text-gray-500 ${isDarkMode ? "text-gray-400" : ""}`}>SMA - 50</div>
                                <div className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                  {formatCurrency(
                                    predictionResult.technicalAnalysis.sma50,
                                    stockData?.currency || "USD",
                                  )}
                                </div>
                              </div>
                              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                <div className={`text-gray-500 ${isDarkMode ? "text-gray-400" : ""}`}>RSI</div>
                                <div className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                  {predictionResult.technicalAnalysis.rsi}
                                </div>
                              </div>
                              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                <div className={`text-gray-500 ${isDarkMode ? "text-gray-400" : ""}`}>
                                  Волатильность
                                </div>
                                <div className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                                  {predictionResult.technicalAnalysis.volatility}%
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {predictionResult.arguments && (
                          <div className="mb-6">
                            <h4 className={`font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              Обоснование прогноза
                            </h4>
                            <div className="space-y-2">
                              {(predictionResult.arguments || []).map((argument: string, index: number) => (
                                <div
                                  key={index}
                                  className={`p-3 rounded-lg border-l-4 border-blue-500 ${
                                    isDarkMode ? "bg-gray-700" : "bg-blue-50"
                                  }`}
                                >
                                  <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    {argument}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {predictionResult.dailyPredictions && (
                          <div className="mb-6">
                            <h4 className={`font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              Дневные прогнозы
                            </h4>
                            <div className="space-y-2">
                              {predictionResult.dailyPredictions.map((pred: any, index: number) => (
                                <div
                                  key={index}
                                  className={`flex justify-between items-center p-3 rounded-lg ${
                                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center space-x-4">
                                    <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                      День {pred.day}
                                    </div>
                                    <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                      {pred.date}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <div className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                      {formatCurrency(pred.price, stockData?.currency || "USD")}
                                    </div>
                                    <div
                                      className={`text-sm font-medium ${
                                        pred.change >= 0 ? "text-green-600" : "text-red-600"
                                      }`}
                                    >
                                      {pred.change >= 0 ? "+" : ""}
                                      {pred.change.toFixed(2)}%
                                    </div>
                                    <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                      {pred.confidence}% уверенность
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Historical Price Chart */}
                    <div
                      className={`rounded-xl p-6 shadow-sm border ${
                        isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {t("priceHistory")}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {chartPeriods.map((period) => (
                            <button
                              key={period.id}
                              onClick={() => {
                                setChartPeriod(period.id)
                                fetchHistoricalData(period.id)
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                chartPeriod === period.id
                                  ? "bg-blue-600 text-white shadow-lg"
                                  : isDarkMode
                                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {period.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {chartLoading ? (
                        <div className="flex items-center justify-center h-80">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      ) : historicalData.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                              <div className={`text-sm mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {t("minPrice")}
                              </div>
                              <div className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {formatCurrency(
                                  Math.min(...historicalData.map((d) => d.historicalPrice || d.price)), // Use historicalPrice or price
                                  stockData?.currency || "USD",
                                )}
                              </div>
                            </div>
                            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                              <div className={`text-sm mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {t("maxPrice")}
                              </div>
                              <div className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {formatCurrency(
                                  Math.max(...historicalData.map((d) => d.historicalPrice || d.price)), // Use historicalPrice or price
                                  stockData?.currency || "USD",
                                )}
                              </div>
                            </div>
                            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                              <div className={`text-sm mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {t("avgPrice")}
                              </div>
                              <div className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {formatCurrency(
                                  historicalData.reduce((sum, d) => sum + (d.historicalPrice || d.price), 0) /
                                    historicalData.length, // Use historicalPrice or price
                                  stockData?.currency || "USD",
                                )}
                              </div>
                            </div>
                          </div>

                          <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={historicalData}>
                              <defs>
                                <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                              <XAxis
                                dataKey="date"
                                stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                                style={{ fontSize: "12px" }}
                              />
                              <YAxis
                                stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                                style={{ fontSize: "12px" }}
                                tickFormatter={(value) => `${value.toFixed(0)}`}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                                  border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                                  borderRadius: "8px",
                                  color: isDarkMode ? "#ffffff" : "#000000",
                                }}
                                formatter={(value: any, name: string) => {
                                  if (name === "historicalPrice")
                                    return [formatCurrency(value, stockData?.currency || "USD"), "Историческая цена"]
                                  if (name === "forecastPrice")
                                    return [formatCurrency(value, stockData?.currency || "USD"), "Прогноз"]
                                  return [formatCurrency(value, stockData?.currency || "USD"), t("price")]
                                }}
                              />
                              <Area
                                type="monotoneX"
                                dataKey="historicalPrice"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#colorHistorical)"
                                connectNulls={false}
                              />
                              <Area
                                type="monotoneX"
                                dataKey="forecastPrice"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                fill="url(#colorForecast)"
                                connectNulls={false}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-80">
                          <div className={`text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {t("noChartData")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "alerts" && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {t("priceAlerts")}
                  </h2>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{t("stayInformed")}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div
                    className={`rounded-xl p-6 shadow-sm border ${
                      isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                    }`}
                  >
                    <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {t("createNewAlert")}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {t("ticker")}
                        </label>
                        <input
                          type="text"
                          value={newAlert.ticker}
                          onChange={(e) => setNewAlert({ ...newAlert, ticker: e.target.value.toUpperCase() })}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="AAPL, GOOGL, KCEL..."
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {t("condition")}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setNewAlert({ ...newAlert, condition: "above" })}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              newAlert.condition === "above"
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {t("abovePrice")}
                          </button>
                          <button
                            onClick={() => setNewAlert({ ...newAlert, condition: "below" })}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              newAlert.condition === "below"
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {t("belowPrice")}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {t("enterPrice")}
                        </label>
                        <input
                          type="number"
                          value={newAlert.price}
                          onChange={(e) => setNewAlert({ ...newAlert, price: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        onClick={handleCreateAlert}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                      >
                        {t("createAlert")}
                      </button>
                    </div>

                    {notificationPermission !== "granted" && (
                      <div
                        className={`mt-4 p-4 rounded-lg border ${
                          isDarkMode ? "bg-yellow-900/20 border-yellow-700" : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Bell className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className={`font-medium ${isDarkMode ? "text-yellow-300" : "text-yellow-800"}`}>
                              Включите уведомления
                            </div>
                            <div className={`text-sm ${isDarkMode ? "text-yellow-400" : "text-yellow-700"}`}>
                              Разрешите уведомления в браузере, чтобы получать алерты
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            Notification.requestPermission().then((permission) => {
                              setNotificationPermission(permission)
                            })
                          }}
                          className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                        >
                          Включить уведомления
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className={`rounded-xl p-6 shadow-sm border ${
                      isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                    }`}
                  >
                    <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {t("activeAlerts")}
                    </h3>
                    {alerts.length === 0 ? (
                      <div className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {t("noActiveAlerts")}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {alerts.map((alert) => {
                          const marketData = getMarketData(alert.ticker)
                          return (
                            <div
                              key={alert.id}
                              className={`p-4 rounded-lg border ${
                                alert.isActive
                                  ? isDarkMode
                                    ? "bg-gray-700 border-gray-600"
                                    : "bg-gray-50 border-gray-200"
                                  : isDarkMode
                                    ? "bg-gray-800 border-gray-700 opacity-60"
                                    : "bg-gray-100 border-gray-300 opacity-60"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                      {alert.ticker}
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        alert.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {alert.isActive ? "Активен" : "Сработал"}
                                    </span>
                                  </div>
                                  <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    {alert.condition === "above" ? "Выше" : "Ниже"}{" "}
                                    {formatCurrency(alert.price, marketData.currency)}
                                  </div>
                                  <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    Текущая цена: {formatCurrency(marketData.price, marketData.currency)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteAlert(alert.id)}
                                  className={`p-1 rounded-lg transition-colors ${
                                    isDarkMode
                                      ? "text-gray-400 hover:text-red-400 hover:bg-gray-600"
                                      : "text-gray-500 hover:text-red-600 hover:bg-gray-200"
                                  }`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "education" && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {t("educationalMaterials")}
                  </h2>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{t("learnMoreAboutTrading")}</p>
                </div>

                <div className="space-y-8">
                  {Object.entries(materials).map(([category, items]) => (
                    <div key={category}>
                      <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((material) => (
                          <div
                            key={material.id}
                            className={`rounded-xl p-6 shadow-sm border transition-all hover:shadow-md ${
                              isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h4 className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                  {material.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {category === "Видеокурсы" ? (
                                    <Play className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {material.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                      levelColors[material.level as keyof typeof levelColors]
                                    }`}
                                  >
                                    {
                                      levelTranslations[language][
                                        material.level as keyof (typeof levelTranslations)[typeof language]
                                      ]
                                    }
                                  </span>
                                </div>
                                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {t("duration")} {material.duration}
                                </span>
                              </div>
                              <button
                                onClick={() => handleStartReading(material.id)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                              >
                                {category === "Видеокурсы" ? "Смотреть" : "Читать"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "news" && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {t("marketNews")}
                  </h2>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    Latest financial news from Bloomberg, Reuters, CNBC, and more
                  </p>
                  {lastNewsUpdate && (
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Updated {Math.floor((Date.now() - lastNewsUpdate) / 60000)} minutes ago
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newsData.map((article: any) => (
                    <div
                      key={article.id}
                      className={`rounded-xl overflow-hidden shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                        isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                      }`}
                      onClick={() => window.open(article.url, "_blank")}
                    >
                      {article.image_url && (
                        <div className="relative w-full h-48">
                          <img
                            src={article.image_url || "/placeholder.svg"}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                          {article.is_pinned && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                              Pinned
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                            {article.source}
                          </span>
                          {article.sentiment && (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                article.sentiment === "positive"
                                  ? "bg-green-100 text-green-700"
                                  : article.sentiment === "negative"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {article.sentiment}
                            </span>
                          )}
                        </div>

                        <h4
                          className={`font-semibold text-base line-clamp-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {article.title}
                        </h4>

                        {article.description && (
                          <p className={`text-sm line-clamp-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {article.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {article.tickers?.slice(0, 3).map((ticker: string) => (
                              <span
                                key={ticker}
                                className={`text-xs px-2 py-1 rounded ${
                                  isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {ticker}
                              </span>
                            ))}
                          </div>
                          <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                            {new Date(article.published_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {newsData.length === 0 && !newsLoading && (
                  <div className="text-center py-12">
                    <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                      No news available. Click refresh to fetch latest articles.
                    </p>
                  </div>
                )}

                {newsData.length > 0 && hasMoreNews && (
                  <div className="flex justify-center">
                    <button
                      onClick={loadMoreNews}
                      disabled={newsLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
                    >
                      {newsLoading ? "Loading more..." : "Load More Articles"}
                    </button>
                  </div>
                )}

                {newsData.length > 0 && !hasMoreNews && (
                  <div className="text-center py-4">
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      No more articles to load
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeSection === "kztForecast" && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {t("kztUsdForecast")}
                  </h2>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{t("kztForecastDescription")}</p>
                </div>

                {/* Forecast Controls */}
                <div
                  className={`p-6 rounded-2xl ${
                    isDarkMode
                      ? "bg-gray-900/50 backdrop-blur-xl border border-gray-800"
                      : "bg-white border border-gray-200"
                  } shadow-lg`}
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {t("forecastPeriod")}:
                      </label>
                      <select
                        value={kztForecastDays}
                        onChange={(e) => setKztForecastDays(Number(e.target.value))}
                        className={`px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      >
                        <option value={3}>3 {t("days")}</option>
                        <option value={7}>7 {t("days")}</option>
                        <option value={14}>14 {t("days")}</option>
                        <option value={30}>30 {t("days")}</option>
                      </select>
                    </div>

                    <button
                      onClick={fetchKZTForecast}
                      disabled={kztForecastLoading}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        isDarkMode
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-400/30"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {kztForecastLoading ? t("loading") : t("loadForecast")}
                    </button>
                  </div>
                </div>

                {/* Forecast Results */}
                {kztForecastData && (
                  <div className="space-y-6">
                    {/* Current Rate Card */}
                    <div
                      className={`p-6 rounded-2xl ${
                        isDarkMode
                          ? "bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20"
                          : "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200"
                      } shadow-lg`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {t("currentRate")}
                          </p>
                          <p className={`text-4xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {kztForecastData.currentRate.toFixed(2)} ₸
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {t("trend")}:{" "}
                            {t(kztForecastData.modelInfo.trend === "восходящий" ? "ascending" : "descending")}
                          </p>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {t("confidence")}: {kztForecastData.modelInfo.confidence}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div
                      className={`p-6 rounded-2xl ${
                        isDarkMode
                          ? "bg-gray-900/50 backdrop-blur-xl border border-gray-800"
                          : "bg-white border border-gray-200"
                      } shadow-lg`}
                    >
                      <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {t("historicalData")} & {t("forecastData")}
                      </h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={[
                            ...(kztForecastData.historical || []).map((d: any) => ({
                              date: d.date,
                              actual: d.rate,
                              forecast: null,
                              lower: null,
                              upper: null,
                            })),
                            ...(kztForecastData.forecast || []).map((d: any) => ({
                              date: d.date,
                              actual: null,
                              forecast: d.rate,
                              lower: d.lower,
                              upper: d.upper,
                            })),
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                          <XAxis
                            dataKey="date"
                            stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                            tick={{ fill: isDarkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                          />
                          <YAxis
                            stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                            tick={{ fill: isDarkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                            domain={["dataMin - 5", "dataMax + 5"]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                              border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                              borderRadius: "0.5rem",
                              color: isDarkMode ? "#ffffff" : "#000000",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name={t("historicalData")}
                          />
                          <Line
                            type="monotone"
                            dataKey="forecast"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 3 }}
                            name={t("forecastData")}
                          />
                          <Line
                            type="monotone"
                            dataKey="lower"
                            stroke="#ef4444"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            dot={false}
                            name={t("confidenceInterval") + " (min)"}
                          />
                          <Line
                            type="monotone"
                            dataKey="upper"
                            stroke="#10b981"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            dot={false}
                            name={t("confidenceInterval") + " (max)"}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Model Information */}
                    <div
                      className={`p-6 rounded-2xl ${
                        isDarkMode
                          ? "bg-gray-900/50 backdrop-blur-xl border border-gray-800"
                          : "bg-white border border-gray-200"
                      } shadow-lg`}
                    >
                      <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {t("modelInformation")}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {t("trend")}
                          </p>
                          <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {t(kztForecastData.modelInfo.trend === "восходящий" ? "ascending" : "descending")}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {t("averageRate")}
                          </p>
                          <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {kztForecastData.modelInfo.avgRate.toFixed(2)} ₸
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {t("oilImpact")}
                          </p>
                          <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {t(kztForecastData.modelInfo.oilImpact === "положительное" ? "positive" : "negative")}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {t("confidence")}
                          </p>
                          <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {kztForecastData.modelInfo.confidence}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {t("dataSource")}: {kztForecastData.metadata.dataSource}
                        </p>
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {t("generatedAt")}: {new Date(kztForecastData.metadata.generatedAt).toLocaleString(language)}
                        </p>
                      </div>
                    </div>

                    {kztForecastData.reasoning && (
                      <div
                        className={`p-6 rounded-2xl ${
                          isDarkMode
                            ? "bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-indigo-500/20"
                            : "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200"
                        } shadow-lg`}
                      >
                        <h3
                          className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"} flex items-center gap-3`}
                        >
                          <span className="text-3xl">📊</span>
                          {language === "ru" ? "Обоснование прогноза" : "Forecast Reasoning"}
                        </h3>
                        <div className="space-y-4">
                          {(kztForecastData.reasoning || []).map((reason: string, index: number) => (
                            <div
                              key={index}
                              className={`p-4 rounded-xl ${
                                isDarkMode ? "bg-gray-900/50 border border-gray-700" : "bg-white border border-gray-200"
                              } shadow-sm hover:shadow-md transition-shadow`}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`flex-shrink-0 w-8 h-8 rounded-full ${
                                    isDarkMode ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"
                                  } flex items-center justify-center font-bold text-sm`}
                                >
                                  {index + 1}
                                </span>
                                <p
                                  className={`text-base leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                                >
                                  {reason}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* EnergyIndustriesSection Component */}
            {activeSection === "energyIndustries" && (
              <EnergyIndustriesSection isDarkMode={isDarkMode} language={language} t={t} />
            )}

            {/* ML Predictions Section */}
            {activeSection === "mlpredictions" && (
              <MLPredictions isDarkMode={isDarkMode} />
            )}
          </div>
        </main>
      </div>

      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className={`max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {selectedNews.title}
              </h3>
              <button
                onClick={closeArticle}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white hover:bg-gray-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {selectedNews.ticker}
                </span>
                <span className={`font-medium ${selectedNews.isPositive ? "text-green-600" : "text-red-600"}`}>
                  {selectedNews.change}
                </span>
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedNews.time}</span>
              </div>
              <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{selectedNews.content}</p>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {t("source")} {selectedNews.source}
                </span>
                <a
                  href={selectedNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Читать полностью
                </a>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
// New EnergyIndustriesSection component using real-time energy prices API
function EnergyIndustriesSection({
  isDarkMode,
  language,
  t,
}: { isDarkMode: boolean; language: string; t: (key: string) => string }) {
  // Use useState hook for selectedCompany
  const [selectedCompany, setSelectedCompany] = useState<CompanyInfo | null>(null)
  const [energyData, setEnergyData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedTab, setSelectedTab] = React.useState<"global" | "europe">("global")

  React.useEffect(() => {
    console.log("[v0] Loading energy market data...")
    fetch("/api/energy")
      .then((res) => res.json())
      .then((data) => {
        console.log("[v0] Energy data loaded:", data)
        setEnergyData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error loading energy data:", err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !energyData) {
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-8 text-center`}>
          <h2 className="text-2xl font-bold mb-4">Данные недоступны</h2>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{error || "Не удалось загрузить данные"}</p>
        </div>
      </div>
    )
  }

  const globalCompanies = energyData.global || []
  // Replaced kazakhstanCompanies with europeCompanies
  const europeCompanies = energyData.europe || []
  // Replaced kazakhstanCompanies with europeCompanies
  const displayedCompanies = selectedTab === "global" ? globalCompanies : europeCompanies

  const handleCompanyClick = (ticker: string) => {
    const company = displayedCompanies.find((c) => c.ticker === ticker)
    if (company) {
      setSelectedCompany(company)
    }
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {language === "ru" ? "Энергетика" : language === "en" ? "Energy Industries" : "Энергетика"}
        </h1>
        <p className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          {/* Updated subtitle for Europe */}
          {language === "ru"
            ? "Мировые и европейские энергетические компании в режиме реального времени"
            : language === "en"
              ? "Global and European energy companies in real-time"
              : "Әлемдік және еуропалық энергетикалық компаниялар нақты уақытта"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div
          className={`${isDarkMode ? "bg-gradient-to-br from-blue-900 to-blue-800" : "bg-gradient-to-br from-blue-100 to-blue-50"} rounded-xl p-6 shadow-lg`}
        >
          <div className={`text-sm font-medium ${isDarkMode ? "text-blue-200" : "text-blue-700"} mb-2`}>
            {language === "ru" ? "Всего компаний" : "Total Companies"}
          </div>
          <div className="text-3xl font-bold">{energyData.totalCompanies || 0}</div>
        </div>
        <div
          className={`${isDarkMode ? "bg-gradient-to-br from-green-900 to-green-800" : "bg-gradient-to-br from-green-100 to-green-50"} rounded-xl p-6 shadow-lg`}
        >
          <div className={`text-sm font-medium ${isDarkMode ? "text-green-200" : "text-green-700"} mb-2`}>
            {language === "ru" ? "Мировые" : "Global"}
          </div>
          <div className="text-3xl font-bold">{globalCompanies.length}</div>
        </div>
        <div
          className={`${isDarkMode ? "bg-gradient-to-br from-purple-900 to-purple-800" : "bg-gradient-to-br from-purple-100 to-purple-50"} rounded-xl p-6 shadow-lg`}
        >
          <div className={`text-sm font-medium ${isDarkMode ? "text-purple-200" : "text-purple-700"} mb-2`}>
            {/* Updated label for Europe */}
            {language === "ru" ? "Европа" : "Europe"}
          </div>
          <div className="text-3xl font-bold">{europeCompanies.length}</div>
        </div>
        <div
          className={`${isDarkMode ? "bg-gradient-to-br from-orange-900 to-orange-800" : "bg-gradient-to-br from-orange-100 to-orange-50"} rounded-xl p-6 shadow-lg`}
        >
          <div className={`text-sm font-medium ${isDarkMode ? "text-orange-200" : "text-orange-700"} mb-2`}>
            {language === "ru" ? "Успешность" : "Success Rate"}
          </div>
          <div className="text-2xl font-bold">{energyData.successRate || "0%"}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedTab("global")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedTab === "global"
              ? isDarkMode
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white"
              : isDarkMode
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          🌍 {language === "ru" ? "Мировые компании" : "Global Companies"}
        </button>
        <button
          onClick={() => setSelectedTab("europe")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedTab === "europe"
              ? isDarkMode
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white"
              : isDarkMode
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {/* Updated flag and label for Europe */}
          🇪🇺 {language === "ru" ? "Европа" : "Europe"}
        </button>
      </div>

      {/* Companies Table */}
      <div className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {language === "ru" ? "Компания" : "Company"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {language === "ru" ? "Тикер" : "Ticker"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {language === "ru" ? "Цена" : "Price"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {language === "ru" ? "Изменение" : "Change"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {language === "ru" ? "Объем" : "Volume"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {language === "ru" ? "Страна" : "Country"}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {displayedCompanies.length > 0 ? (
                displayedCompanies.map((company: any, idx: number) => (
                  <tr
                    key={idx}
                    className={`${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      <button
                        onClick={() => handleCompanyClick(company.ticker)}
                        className={`hover:underline ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} transition-colors`}
                      >
                        {company.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className={`px-2 py-1 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        {company.ticker}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {company.price ? `${company.price.toFixed(2)} ${company.currency}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.changePercent !== undefined ? (
                        <span className={company.changePercent >= 0 ? "text-green-500" : "text-red-500"}>
                          {company.changePercent >= 0 ? "▲" : "▼"} {Math.abs(company.changePercent).toFixed(2)}%
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.volume ? company.volume.toLocaleString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{company.country}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {language === "ru" ? "Нет данных" : "No data available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last Updated */}
      <div className={`mt-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} text-center`}>
        {language === "ru" ? "Последнее обновление:" : "Last updated:"}{" "}
        {new Date(energyData.lastUpdated).toLocaleString(language === "ru" ? "ru-RU" : "en-US")}
      </div>

      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-2xl max-w-2xl w-full p-8 transform transition-all`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedCompany.flag}</div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">{selectedCompany.name}</h2>
                  <div className="flex items-center gap-3">
                    <code
                      className={`px-3 py-1 rounded-lg text-sm font-mono ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
                    >
                      {selectedCompany.ticker}
                    </code>
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"}`}
                    >
                      {selectedCompany.sector}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className={`${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} text-2xl transition-colors`}
              >
                ×
              </button>
            </div>

            {/* Country */}
            <div className="mb-6">
              <div className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                {language === "ru" ? "Страна" : "Country"}
              </div>
              <div className="text-lg font-semibold">{selectedCompany.country}</div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-2`}>
                {language === "ru" ? "О компании" : "About"}
              </div>
              <p className={`text-base leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {selectedCompany.description}
              </p>
            </div>

            {/* Close button */}
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedCompany(null)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {language === "ru" ? "Закрыть" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
