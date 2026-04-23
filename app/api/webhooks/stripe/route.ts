import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import Stripe from "stripe"

export async function POST(req: Request) {
  // Only process if environment variables are set
  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    )
  }

  try {
    const { createClient } = await import("@supabase/supabase-js")
    
    // Create admin client for webhook (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      const stripe = getStripe()
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } else {
        event = JSON.parse(body) as Stripe.Event
      }
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const stripe = getStripe()

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const productId = session.metadata?.product_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (userId && productId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          const { error } = await supabaseAdmin
            .from("subscriptions")
            .upsert({
              user_id: userId,
              plan_id: productId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: subscription.status,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })

          if (error) {
            console.error("Error updating subscription:", error)
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (existingSub) {
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existingSub.user_id)

          if (error) {
            console.error("Error updating subscription:", error)
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (existingSub) {
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              plan_id: "free",
              status: "canceled",
              stripe_subscription_id: null,
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existingSub.user_id)

          if (error) {
            console.error("Error canceling subscription:", error)
          }
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const customerId = subscription.customer as string

          const { data: existingSub } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .single()

          if (existingSub) {
            await supabaseAdmin
              .from("subscriptions")
              .update({
                status: "active",
                current_period_end: new Date(
                  subscription.current_period_end * 1000
                ).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", existingSub.user_id)
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (existingSub) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existingSub.user_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
