"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Checkout } from "@/components/checkout"
import { getProduct, PRODUCTS } from "@/lib/products"
import { TrendingUp, ArrowLeft, Check, Shield } from "lucide-react"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan") || "pro-monthly"
  const product = getProduct(planId) || PRODUCTS[1]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/pricing" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
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
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold">FinPredict</span>
              </div>

              <h1 className="text-2xl font-bold mb-2">
                Subscribe to {product.name}
              </h1>
              <p className="text-muted-foreground mb-8">
                {product.description}
              </p>

              <div className="p-6 rounded-xl bg-muted/50 border border-border mb-8">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="font-medium">{product.name} Plan</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold">
                      ${(product.priceInCents / 100).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      /{product.interval}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure payment powered by Stripe</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="order-1 lg:order-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-6">Payment Details</h2>
              <Checkout productId={planId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
