export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  interval: "month" | "year"
  features: string[]
  popular?: boolean
  savings?: string
}

export const PRODUCTS: Product[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic predictions",
    priceInCents: 0,
    interval: "month",
    features: [
      "5 stock predictions per day",
      "Basic technical indicators",
      "Daily market overview",
      "Email support",
    ],
  },
  {
    id: "pro-monthly",
    name: "Pro",
    description: "Advanced features for serious traders",
    priceInCents: 2900, // $29/month
    interval: "month",
    popular: true,
    features: [
      "Unlimited predictions",
      "All technical indicators",
      "Real-time news sentiment",
      "Ensemble model access",
      "Custom watchlists",
      "Priority support",
      "API access",
    ],
  },
  {
    id: "pro-yearly",
    name: "Pro Yearly",
    description: "Best value for committed traders",
    priceInCents: 29000, // $290/year
    interval: "year",
    savings: "Save $58/year",
    features: [
      "Everything in Pro Monthly",
      "2 months free",
      "Early access to features",
      "Dedicated account manager",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for teams",
    priceInCents: 9900, // $99/month
    interval: "month",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
      "Dedicated support",
    ],
  },
]

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getProductPrice(id: string): number {
  const product = getProduct(id)
  return product?.priceInCents ?? 0
}
