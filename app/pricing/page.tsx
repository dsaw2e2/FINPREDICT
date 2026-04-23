import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { PRODUCTS } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { TrendingUp, Check, ArrowRight, Zap, Sparkles, Shield } from "lucide-react"

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get current subscription
  let currentPlan = "free"
  if (user) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("user_id", user.id)
      .single()
    
    if (subscription) {
      currentPlan = subscription.plan_id
    }
  }

  // Filter to show only the main plans
  const displayProducts = PRODUCTS.filter(p => 
    ["free", "pro-monthly", "pro-yearly", "enterprise"].includes(p.id)
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">FinPredict</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Hero */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-500/20 via-purple-500/10 to-transparent blur-3xl" />
        </div>
        
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white text-balance">
            Choose the plan that&apos;s right for you
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Start free and upgrade when you need more power. All plans include a 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {displayProducts.map((product) => {
              const isCurrentPlan = currentPlan === product.id || 
                (currentPlan.startsWith("pro") && product.id.startsWith("pro"))
              const isFree = product.priceInCents === 0
              const isPro = product.popular
              
              return (
                <div
                  key={product.id}
                  className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                    isPro 
                      ? "border-2 border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-purple-500/5 shadow-xl shadow-blue-500/10" 
                      : "border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-500/30">
                      Most Popular
                    </div>
                  )}
                  
                  {product.savings && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-sm font-medium rounded-full shadow-lg shadow-green-500/30">
                      {product.savings}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      {isPro && <Sparkles className="w-4 h-4 text-blue-400" />}
                      <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                    </div>
                    <p className="text-sm text-zinc-500">{product.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        ${(product.priceInCents / 100).toFixed(0)}
                      </span>
                      {!isFree && (
                        <span className="text-zinc-500">
                          /{product.interval === "year" ? "year" : "mo"}
                        </span>
                      )}
                    </div>
                    {product.interval === "year" && (
                      <p className="text-sm text-zinc-500 mt-1">
                        ${((product.priceInCents / 100) / 12).toFixed(0)}/month billed annually
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPro ? "bg-blue-500/20" : "bg-zinc-800"
                        }`}>
                          <Check className={`w-3 h-3 ${isPro ? "text-blue-400" : "text-zinc-500"}`} />
                        </div>
                        <span className="text-zinc-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      disabled 
                      className="w-full bg-zinc-800/50 border-zinc-700 text-zinc-500"
                    >
                      Current Plan
                    </Button>
                  ) : isFree ? (
                    <Button 
                      variant="outline" 
                      asChild 
                      className="w-full bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
                    >
                      <Link href="/auth/sign-up">
                        Get Started Free
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : user ? (
                    <Button 
                      asChild 
                      className={`w-full ${
                        isPro 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-lg shadow-blue-500/20" 
                          : "bg-zinc-800 hover:bg-zinc-700 border-0"
                      }`}
                    >
                      <Link href={`/pricing/checkout?plan=${product.id}`}>
                        Upgrade to {product.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      className={`w-full ${
                        isPro 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-lg shadow-blue-500/20" 
                          : "bg-zinc-800 hover:bg-zinc-700 border-0"
                      }`}
                    >
                      <Link href={`/auth/sign-up?plan=${product.id}`}>
                        Start Free Trial
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express) through our secure Stripe integration."
              },
              {
                q: "Is there a free trial?",
                a: "Yes! All paid plans come with a 14-day free trial. No credit card required to start."
              },
              {
                q: "How accurate are the predictions?",
                a: "Our ensemble model achieves 94.2% directional accuracy on backtested data. However, past performance doesn't guarantee future results."
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <h3 className="font-semibold mb-2 text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  {item.q}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-zinc-600 text-sm">
            Not financial advice · 2025 FinPredict
          </p>
        </div>
      </footer>
    </div>
  )
}
