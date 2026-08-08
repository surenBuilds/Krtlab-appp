/**
 * Payment provider abstraction (spec section 21/31: commission % configurable,
 * abstraction so multiple providers can plug in; section 32: never fake transactions).
 *
 * No provider is wired in by default. When PAYMENT_PROVIDER is unset, every
 * checkout attempt fails with a clear, honest error instead of pretending
 * to succeed. This is intentional — a real payment integration (Stripe,
 * or an Armenia-compatible gateway like Idram/Ameriabank) requires live
 * merchant credentials that must be supplied by Suren, not fabricated here.
 */

export interface CheckoutRequest {
  uid: string;
  itemType: 'certificate' | 'course' | 'subscription';
  itemId: string;
  amountAMD: number;
  successRedirectUrl: string;
  cancelRedirectUrl: string;
}

export interface CheckoutSession {
  checkoutUrl: string;
  providerSessionId: string;
}

export interface FulfillmentEvent {
  providerSessionId: string;
  itemType: CheckoutRequest['itemType'];
  itemId: string;
  uid: string;
  amountAMD: number;
  status: 'succeeded' | 'failed';
}

export interface PaymentProvider {
  name: string;
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  /** Verifies the raw webhook body/signature and returns the parsed fulfillment event, or null if invalid. */
  parseWebhook(rawBody: string, signatureHeader: string | undefined): FulfillmentEvent | null;
}

class NotConfiguredPaymentProvider implements PaymentProvider {
  name = 'none';

  async createCheckout(): Promise<CheckoutSession> {
    throw new Error(
      'No payment provider is configured (PAYMENT_PROVIDER env var unset). ' +
      'Certificate/course purchases cannot be completed until a real provider ' +
      '(e.g. Stripe, Idram, Ameriabank) is integrated and its API keys are set. ' +
      'This is intentional — the platform never simulates a successful payment.'
    );
  }

  parseWebhook(): FulfillmentEvent | null {
    return null;
  }
}

// Platform commission — configurable, never hardcoded into a UI string (spec section 11/21)
export const PLATFORM_COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? '20');
export const CERTIFICATE_PRICE_AMD = Number(process.env.CERTIFICATE_PRICE_AMD ?? '5000');

let activeProvider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (activeProvider) return activeProvider;
  // Future: switch on process.env.PAYMENT_PROVIDER to instantiate a real provider here.
  activeProvider = new NotConfiguredPaymentProvider();
  return activeProvider;
}
