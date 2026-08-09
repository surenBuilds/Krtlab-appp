import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2026-07-29.dahlia" });

export async function createCheckoutSession(userId: string, plan: "monthly" | "yearly", successUrl: string, cancelUrl: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription", payment_method_types: ["card"],
    line_items: [{ price: plan === "monthly" ? (process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly") : (process.env.STRIPE_YEARLY_PRICE_ID || "price_yearly"), quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`, cancel_url: cancelUrl,
    client_reference_id: userId, metadata: { userId, plan },
  });
  return { url: session.url, sessionId: session.id };
}

export async function handleWebhook(body: string, signature: string) {
  try { return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || ""); }
  catch { return null; }
}

export { stripe };