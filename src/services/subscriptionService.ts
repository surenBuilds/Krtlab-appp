import { auth } from '../lib/firebase';

export interface SubscriptionCheckoutResult {
  status: 'pending_payment';
  paymentAvailable: boolean;
  checkoutUrl?: string;
  message?: string;
}

/**
 * Requests a subscription checkout. This NEVER activates a plan client-side —
 * real activation only happens server-side, after a real payment webhook
 * fires (see server.ts /api/subscriptions/checkout and the certificate
 * webhook for the pattern this will follow once a payment provider is
 * configured). Fixes a prior bug where MonetizationSystem.tsx collected
 * card fields and activated "Premium" locally without charging anything.
 */
export async function requestSubscriptionCheckout(plan: 'premium' | 'enterprise'): Promise<SubscriptionCheckoutResult> {
  const user = auth.currentUser;
  if (!user) throw new Error('Պետք է մուտք գործած լինել');
  const idToken = await user.getIdToken();

  const res = await fetch('/api/subscriptions/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (!res.ok && res.status !== 202) throw new Error(data.message || 'Subscription checkout failed');
  return data as SubscriptionCheckoutResult;
}
