import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  ArrowRight, 
  BarChart3, 
  Brain, 
  Zap, 
  Shield,
  ChevronRight,
  Check,
  Star,
  Activity
} from "lucide-react"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">FinPredict</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Activity className="w-4 h-4" />
              AI-Powered Stock Market Intelligence
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-balance">
              Predict Market Moves
              <br />
              <span className="text-primary">Before They Happen</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Harness the power of ensemble machine learning models to get actionable stock predictions with confidence scores, technical analysis, and real-time sentiment data.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button size="lg" asChild className="h-14 px-8 text-base gap-2">
                <Link href="/auth/sign-up">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base gap-2">
                <Link href="/dashboard">
                  View Demo
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">94.2%</div>
                <div className="text-sm text-muted-foreground mt-1">Prediction Accuracy</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">Daily Predictions</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">2,500+</div>
                <div className="text-sm text-muted-foreground mt-1">Active Traders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to make smarter trades
            </h2>
            <p className="text-muted-foreground text-lg">
              Our platform combines cutting-edge AI with comprehensive market data to give you an edge.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Ensemble ML Models",
                description: "SARIMAX, Prophet, and XGBoost models work together with dynamic weighting for more accurate predictions."
              },
              {
                icon: BarChart3,
                title: "Technical Analysis",
                description: "RSI, MACD, Bollinger Bands, ATR, and 20+ indicators calculated in real-time for every stock."
              },
              {
                icon: Activity,
                title: "Real-time Sentiment",
                description: "NewsAPI integration analyzes thousands of articles to gauge market sentiment for each ticker."
              },
              {
                icon: Shield,
                title: "Confidence Scoring",
                description: "Every prediction includes a confidence score and risk assessment so you know what to trust."
              },
              {
                icon: Zap,
                title: "Pre-computed Cache",
                description: "Predictions are pre-computed every 4 hours ensuring lightning-fast response times."
              },
              {
                icon: Star,
                title: "Custom Watchlists",
                description: "Create personalized watchlists and get alerts when predictions change significantly."
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group p-6 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-4 bg-muted/30 border-t border-border">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How FinPredict Works
            </h2>
            <p className="text-muted-foreground text-lg">
              From raw data to actionable insights in three simple steps.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Data Collection",
                  description: "We pull real-time price data, volume, and historical patterns from multiple reliable sources."
                },
                {
                  step: "2",
                  title: "ML Processing",
                  description: "Our ensemble models analyze technical indicators, patterns, and sentiment to generate predictions."
                },
                {
                  step: "3",
                  title: "Actionable Insights",
                  description: "Get clear buy/sell signals with confidence scores, price targets, and risk assessments."
                },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-6">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-border -translate-x-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start free, upgrade when ready
            </h2>
            <p className="text-muted-foreground text-lg mb-12">
              Try FinPredict free with 5 predictions per day. Upgrade anytime for unlimited access.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-8 rounded-2xl border border-border bg-card">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
                <ul className="space-y-3 text-left mb-6">
                  {["5 predictions/day", "Basic indicators", "Email support"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              </div>
              
              <div className="p-8 rounded-2xl border-2 border-primary bg-primary/5 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-4">$29<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
                <ul className="space-y-3 text-left mb-6">
                  {["Unlimited predictions", "All technical indicators", "Real-time sentiment", "API access"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href="/pricing">View All Plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-primary/5 border-t border-border">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to predict the market?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of traders using AI to make smarter investment decisions.
            </p>
            <Button size="lg" asChild className="h-14 px-10 text-base gap-2">
              <Link href="/auth/sign-up">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">FinPredict</span>
            </div>
            
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            </nav>
            
            <p className="text-sm text-muted-foreground">
              &copy; 2026 FinPredict. All rights reserved.
            </p>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              Disclaimer: FinPredict provides AI-generated predictions for informational purposes only. This is not financial advice. 
              Past performance does not guarantee future results. Always consult a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
