import "server-only"
import Stripe from "stripe"

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    stripeClient = new Stripe(apiKey, {
      apiVersion: "2025-03-31.basil",
      typescript: true,
    })
  }
  return stripeClient
}
