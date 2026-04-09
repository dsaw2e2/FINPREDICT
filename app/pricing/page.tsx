import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { PRODUCTS } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { TrendingUp, Check, ArrowRight, Zap } from "lucide-react"

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">FinPredict</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
            Choose the plan that&apos;s right for you
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
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
              
              return (
                <div
                  key={product.id}
                  className={`relative rounded-2xl border p-6 flex flex-col ${
                    product.popular 
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                      : "border-border bg-card"
                  }`}
                >
                  {product.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  {product.savings && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                      {product.savings}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        ${(product.priceInCents / 100).toFixed(0)}
                      </span>
                      {!isFree && (
                        <span className="text-muted-foreground">
                          /{product.interval === "year" ? "year" : "mo"}
                        </span>
                      )}
                    </div>
                    {product.interval === "year" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ${((product.priceInCents / 100) / 12).toFixed(0)}/month billed annually
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button variant="outline" disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : isFree ? (
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/sign-up">
                        Get Started Free
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : user ? (
                    <Button 
                      asChild 
                      className="w-full"
                      variant={product.popular ? "default" : "outline"}
                    >
                      <Link href={`/pricing/checkout?plan=${product.id}`}>
                        Upgrade to {product.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      className="w-full"
                      variant={product.popular ? "default" : "outline"}
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
      <section className="py-20 px-4 border-t border-border bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal through our secure Stripe integration."
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
              <div key={i} className="p-6 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
