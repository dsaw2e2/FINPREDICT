"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { getCheckoutSession } from "@/app/actions/stripe"
import { Button } from "@/components/ui/button"
import { TrendingUp, CheckCircle, ArrowRight, Loader2 } from "lucide-react"

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t verify your payment. Please contact support.
          </p>
          <Button asChild>
            <Link href="/pricing">Back to Pricing</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Pro!
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Your subscription is now active. You have full access to all FinPredict Pro features.
          </p>
          {email && (
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to <strong>{email}</strong>
            </p>
          )}
        </div>

        <div className="p-6 rounded-xl bg-muted/50 border border-border text-left space-y-4">
          <h3 className="font-semibold">What&apos;s next?</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <span>Explore unlimited stock predictions with our ensemble ML models</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">2</span>
              </div>
              <span>Set up custom watchlists and alerts for your favorite stocks</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">3</span>
              </div>
              <span>Access real-time news sentiment and technical indicators</span>
            </li>
          </ul>
        </div>

        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard">
            <TrendingUp className="w-4 h-4" />
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
