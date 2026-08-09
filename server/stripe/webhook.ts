import express from "express";
import { handleWebhook, stripe } from "./index";
const router = express.Router();
router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const event = await handleWebhook(req.body.toString(), sig);
  if (!event) { res.status(400).json({ error: "Invalid signature" }); return; }
  if (event.type === "checkout.session.completed") console.log("Subscription completed");
  res.json({ received: true });
});
router.post("/create-checkout", express.json(), async (req, res) => {
  const { userId, plan, successUrl, cancelUrl } = req.body;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription", payment_method_types: ["card"],
    line_items: [{ price: plan === "monthly" ? (process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly") : (process.env.STRIPE_YEARLY_PRICE_ID || "price_yearly"), quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`, cancel_url: cancelUrl,
    client_reference_id: userId, metadata: { userId, plan },
  });
  res.json({ url: session.url });
});
export default router;