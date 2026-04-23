"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { getCheckoutSession } from "@/app/actions/stripe"
import { Button } from "@/components/ui/button"
import { TrendingUp, CheckCircle, ArrowRight, Loader2, Sparkles, Zap, BarChart3 } from "lucide-react"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus("error")
      return
    }

    getCheckoutSession(sessionId)
      .then((session) => {
        if (session.status === "complete") {
          setStatus("success")
          setEmail(session.customer_email || null)
        } else {
          setStatus("error")
        }
      })
      .catch(() => setStatus("error"))
  }, [sessionId])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="text-zinc-400">
            We couldn&apos;t verify your payment. Please contact support.
          </p>
          <Button asChild className="bg-zinc-800 hover:bg-zinc-700 text-white">
            <Link href="/pricing">Back to Pricing</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Aurora Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 50% 30%, rgba(34, 197, 94, 0.3), transparent),
              radial-gradient(ellipse 40% 30% at 70% 70%, rgba(59, 130, 246, 0.2), transparent),
              radial-gradient(ellipse 50% 30% at 20% 60%, rgba(139, 92, 246, 0.15), transparent)
            `,
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-green-500/10 blur-3xl"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center space-y-8 relative z-10"
      >
        {/* Success Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center backdrop-blur-sm">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 }}
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/50"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title & Description */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            Welcome to Pro!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-400 leading-relaxed"
          >
            Your subscription is now active. You have full access to all FinPredict Pro features.
          </motion.p>
          {email && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-zinc-500"
            >
              Confirmation sent to <span className="text-zinc-300 font-medium">{email}</span>
            </motion.p>
          )}
        </div>

        {/* What's Next Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm text-left space-y-4"
        >
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            What&apos;s unlocked
          </h3>
          <ul className="space-y-3">
            {[
              { icon: BarChart3, text: "Unlimited stock predictions with ensemble ML models", color: "text-blue-400" },
              { icon: TrendingUp, text: "Real-time alerts and custom watchlists", color: "text-green-400" },
              { icon: Sparkles, text: "Priority access to new features and API", color: "text-purple-400" },
            ].map((item, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className={`w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}>
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-zinc-400">{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button 
            asChild 
            size="lg" 
            className="gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-0 shadow-lg shadow-green-500/25 h-14 text-base"
          >
            <Link href="/dashboard">
              <TrendingUp className="w-5 h-5" />
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
