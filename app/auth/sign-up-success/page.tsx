"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TrendingUp, Mail, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Aurora Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 50% 30%, rgba(34, 197, 94, 0.3), transparent),
              radial-gradient(ellipse 40% 30% at 70% 70%, rgba(59, 130, 246, 0.2), transparent)
            `,
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-green-500/10 blur-3xl"
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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center backdrop-blur-sm">
              <Mail className="w-10 h-10 text-green-400" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title & Description */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            Check your email
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-400 leading-relaxed"
          >
            We&apos;ve sent you a confirmation link. Click the link in your email to activate your account and start using FinPredict.
          </motion.p>
        </div>

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm text-zinc-300 font-medium mb-1">What&apos;s next?</p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Once you confirm your email, you&apos;ll have full access to AI-powered predictions, technical analysis, and market insights.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Didn't receive email */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50"
        >
          <p className="text-sm text-zinc-500">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link href="/auth/sign-up" className="text-blue-400 hover:text-blue-300 transition-colors">
              try again
            </Link>
          </p>
        </motion.div>

        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="pt-4"
        >
          <Button 
            asChild 
            variant="outline" 
            className="gap-2 bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
          >
            <Link href="/">
              <TrendingUp className="w-4 h-4" />
              Back to FinPredict
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
