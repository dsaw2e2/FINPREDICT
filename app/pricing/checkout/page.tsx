"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Checkout } from "@/components/checkout"
import { getProduct, PRODUCTS } from "@/lib/products"
import { TrendingUp, ArrowLeft, Check, Shield, Lock, Zap } from "lucide-react"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan") || "pro-monthly"
  const product = getProduct(planId) || PRODUCTS[1]

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/pricing" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to pricing
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">FinPredict</span>
              </div>

              <h1 className="text-3xl font-bold mb-2 text-white">
                Subscribe to {product.name}
              </h1>
              <p className="text-zinc-400 mb-8">
                {product.description}
              </p>

              {/* Plan Summary Card */}
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold text-white">{product.name} Plan</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white">
                      ${(product.priceInCents / 100).toFixed(2)}
                    </span>
                    <span className="text-zinc-500">
                      /{product.interval}
                    </span>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-sm text-zinc-400 mb-3">Includes:</p>
                  <ul className="space-y-2">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-blue-400" />
                        </div>
                        <span className="text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Security badges */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-zinc-300 font-medium">Secure payment</p>
                    <p className="text-zinc-500 text-xs">256-bit SSL encryption</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-zinc-300 font-medium">Powered by Stripe</p>
                    <p className="text-zinc-500 text-xs">Industry-leading payment security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="order-1 lg:order-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <h2 className="text-xl font-semibold mb-6 text-white">Payment Details</h2>
              <Checkout productId={planId} />
            </div>
            
            <p className="text-xs text-zinc-600 text-center mt-4 leading-relaxed">
              By subscribing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-zinc-400 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-zinc-400 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
