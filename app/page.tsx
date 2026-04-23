"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { LampContainer } from "@/components/ui/lamp"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { BackgroundPaths } from "@/components/ui/background-paths"
import { TrendingUp, ArrowRight, Brain, BarChart3, Activity, Shield, Zap, BookOpen } from "lucide-react"

const features = [
  {
    title: "ИИ-прогнозы S&P 500",
    description:
      "Ансамбль LSTM + SARIMAX + Prophet + XGBoost с уверенностью до 87%. Прогнозы на 1 день, 1 неделю и 1 месяц по 40+ акциям.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border border-blue-700/30 items-center justify-center overflow-hidden p-4">
        <div className="flex gap-1 items-end h-16">
          {[35, 55, 42, 70, 48, 82, 65, 78, 55, 68].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
              className={`w-5 rounded-t-sm ${h > 70 ? "bg-green-400" : h > 50 ? "bg-blue-400" : "bg-blue-600/70"}`}
              style={{ minHeight: 4 }}
            />
          ))}
        </div>
      </div>
    ),
    icon: <Brain className="w-4 h-4 text-blue-400" />,
    className: "md:col-span-2",
  },
  {
    title: "Курс USD/KZT",
    description:
      "Прогноз тенге с учётом нефти Brent, RSI и сезонности. Prophet + XGBoost ансамбль.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-amber-900/40 to-orange-900/40 border border-amber-700/30 items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-400">524.5</div>
          <div className="text-xs text-amber-500/80 mt-1">KZT / USD</div>
          <div className="text-xs text-green-400 mt-1">+0.18% прогноз ↑</div>
        </div>
      </div>
    ),
    icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
    className: "md:col-span-1",
  },
  {
    title: "Нефтяной рынок",
    description:
      "Анализ Brent, WTI и газа с корреляцией к казахстанскому рынку и тенге.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-700/30 items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <span className="text-emerald-400 text-lg font-bold">▲</span>
          </div>
          <div>
            <div className="text-emerald-400 font-bold text-xl">$82.4</div>
            <div className="text-xs text-emerald-500/80">Brent Crude</div>
          </div>
        </div>
      </div>
    ),
    icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
    className: "md:col-span-1",
  },
  {
    title: "Новостная аналитика",
    description:
      "NLP-анализ настроений финансовых новостей в реальном времени из Reuters, Bloomberg и других источников.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-700/30 items-start justify-start p-4 gap-2 flex-col">
        {[
          { text: "Рынок укрепляется", sentiment: "pos" },
          { text: "Инфляция замедляется", sentiment: "pos" },
          { text: "ФРС сохраняет ставку", sentiment: "neu" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 w-full">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.sentiment === "pos" ? "bg-green-400" : "bg-yellow-400"}`} />
            <span className="text-xs text-purple-200/80 truncate">{item.text}</span>
          </div>
        ))}
      </div>
    ),
    icon: <Activity className="w-4 h-4 text-purple-400" />,
    className: "md:col-span-1",
  },
  {
    title: "Обучение и аналитика",
    description:
      "Статьи, видеокурсы по трейдингу и ML в финансах для начинающих и продвинутых инвесторов.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-sky-900/40 to-blue-900/40 border border-sky-700/30 items-center justify-center gap-4">
        {[
          { lvl: "A", label: "Начинающий", color: "text-green-400 border-green-500/40 bg-green-500/10" },
          { lvl: "B", label: "Средний", color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10" },
          { lvl: "C", label: "Эксперт", color: "text-red-400 border-red-500/40 bg-red-500/10" },
        ].map((item) => (
          <div key={item.lvl} className="text-center">
            <div className={`w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-bold border ${item.color}`}>
              {item.lvl}
            </div>
            <span className="text-xs text-sky-300/70">{item.label}</span>
          </div>
        ))}
      </div>
    ),
    icon: <BookOpen className="w-4 h-4 text-sky-400" />,
    className: "md:col-span-2",
  },
]

const stats = [
  { value: "40+", label: "Акций S&P 500" },
  { value: "87%", label: "Точность модели" },
  { value: "4", label: "ML-модели" },
  { value: "3", label: "Языка" },
]

const howItWorks = [
  {
    step: "01",
    title: "Данные в реальном времени",
    desc: "Yahoo Finance, новостные API, цены нефти и макроэкономические индикаторы собираются автоматически.",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    step: "02",
    title: "Ансамбль ML-моделей",
    desc: "LSTM обрабатывает последовательности, Prophet — сезонность, XGBoost — нелинейные паттерны.",
    color: "text-indigo-400",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/5",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    step: "03",
    title: "Точный прогноз",
    desc: "Meta-стекинг объединяет предсказания в финальный вывод с доверительным интервалом.",
    color: "text-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/5",
    icon: <Shield className="w-5 h-5" />,
  },
]

export default function LandingPage() {
  return (
    <div className="bg-zinc-950 min-h-screen overflow-x-hidden">

      {/* HERO — Aurora Background */}
      <AuroraBackground className="min-h-screen" showRadialGradient>
        {/* Navbar */}
        <div className="absolute top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">FinPredict</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-zinc-400 hover:text-white text-sm transition-colors hidden sm:block"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="text-zinc-400 hover:text-white text-sm transition-colors hidden sm:block"
            >
              Dashboard
            </Link>
            <Link
              href="/auth/login"
              className="text-zinc-400 hover:text-white text-sm transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-5"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-300 text-sm font-medium">
              <Activity className="w-3.5 h-3.5" />
              Платформа финансового прогнозирования с ИИ
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight text-balance leading-tight"
          >
            Fin
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400">
              Predict
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 text-pretty leading-relaxed"
          >
            Прогнозируйте рынки с помощью ансамбля нейронных сетей. LSTM, SARIMAX, Prophet и XGBoost
            объединены для максимальной точности.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
            >
              View Pricing
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-10 pb-10"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </AuroraBackground>

      {/* BENTO GRID — Features */}
      <section className="py-24 px-4 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Всё для анализа рынков
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-pretty">
              Единая платформа: прогнозы ИИ, новостная аналитика, валютные курсы и образование.
            </p>
          </motion.div>

          <BentoGrid>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className={f.className}
              >
                <BentoGridItem
                  title={f.title}
                  description={f.description}
                  header={f.header}
                  icon={f.icon}
                  className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-600 h-full"
                />
              </motion.div>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* HOW IT WORKS — BackgroundPaths */}
      <section className="relative overflow-hidden">
        <BackgroundPaths>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance"
          >
            Как это работает
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-zinc-400 mb-12 max-w-lg"
          >
            От сырых данных до точного прогноза в три шага.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-xl border ${item.border} ${item.bg} backdrop-blur-sm p-6 text-left`}
              >
                <div className={`flex items-center gap-2 ${item.color} mb-3`}>
                  {item.icon}
                  <span className="text-xs font-mono font-bold opacity-60">{item.step}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </BackgroundPaths>
      </section>

      {/* LAMP CTA */}
      <LampContainer>
        <motion.h2
          initial={{ opacity: 0.5, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl md:text-6xl font-bold tracking-tight text-transparent text-balance"
        >
          Start Predicting <br /> Markets Today
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-zinc-400 text-center max-w-md mt-4 text-pretty leading-relaxed"
        >
          Join thousands of traders using AI-powered predictions. Start your 14-day free trial today.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-base transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold text-base transition-all"
          >
            View Plans
          </Link>
        </motion.div>
      </LampContainer>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/50 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-zinc-300 font-semibold text-sm">FinPredict</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/pricing" className="text-zinc-500 hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/auth/login" className="text-zinc-500 hover:text-white transition-colors">Sign in</Link>
          </div>
          <div className="text-zinc-600 text-xs text-center">Not financial advice · 2025 FinPredict</div>
        </div>
      </footer>
    </div>
  )
}
