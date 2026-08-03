import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

type CurrentUser = { clients?: Array<{ stripe_customer_id?: string | null }> };
type SafePaymentMethod = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

function cors() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'authorization,content-type',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  };
}

function json(statusCode: number, body: Record<string, unknown>) {
  return { statusCode, headers: { 'Content-Type': 'application/json', ...cors() }, body: JSON.stringify(body) };
}

async function getAuthenticatedUser(authorization?: string): Promise<CurrentUser | null> {
  if (!authorization?.startsWith('Bearer ')) return null;

  const apiHost = process.env.API_HOST || process.env.VITE_API_HOST;
  if (!apiHost) throw new Error('API host is not configured');

  const response = await fetch(`${apiHost}/users/me`, {
    headers: { Authorization: authorization, Accept: 'application/json' },
  });

  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error(`User lookup failed with ${response.status}`);

  return response.json() as Promise<CurrentUser>;
}

function summarizePaymentMethod(paymentMethod: Stripe.PaymentMethod | string | null | undefined) {
  if (!paymentMethod || typeof paymentMethod === 'string' || paymentMethod.type !== 'card' || !paymentMethod.card) {
    return { hasPaymentMethod: false, paymentMethod: null };
  }

  const safePaymentMethod: SafePaymentMethod = {
    brand: paymentMethod.card.brand,
    last4: paymentMethod.card.last4,
    expMonth: paymentMethod.card.exp_month,
    expYear: paymentMethod.card.exp_year,
  };

  return { hasPaymentMethod: true, paymentMethod: safePaymentMethod };
}

async function getActiveSubscriptionDefaultPaymentMethod(stripeCustomerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'active',
    limit: 1,
    expand: ['data.default_payment_method'],
  });

  const defaultPaymentMethod = subscriptions.data[0]?.default_payment_method;
  return defaultPaymentMethod || null;
}

async function getAttachedCardPaymentMethod(stripeCustomerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: 'card',
    limit: 1,
  });

  return paymentMethods.data[0] || null;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors(), body: '' };
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method Not Allowed' });

  try {
    const user = await getAuthenticatedUser(event.headers.authorization || event.headers.Authorization);
    if (!user) return json(401, { error: 'Authentication is required.' });

    const stripeCustomerId = user.clients?.[0]?.stripe_customer_id;
    if (!stripeCustomerId || !stripeCustomerId.startsWith('cus_')) {
      return json(200, { hasPaymentMethod: false, paymentMethod: null });
    }

    const subscriptionPaymentMethod = await getActiveSubscriptionDefaultPaymentMethod(stripeCustomerId);
    const subscriptionSummary = summarizePaymentMethod(subscriptionPaymentMethod);
    if (subscriptionSummary.hasPaymentMethod) return json(200, subscriptionSummary);

    const customer = await stripe.customers.retrieve(stripeCustomerId, {
      expand: ['invoice_settings.default_payment_method'],
    });

    if (customer.deleted) return json(200, { hasPaymentMethod: false, paymentMethod: null });

    const customerSummary = summarizePaymentMethod(customer.invoice_settings?.default_payment_method);
    if (customerSummary.hasPaymentMethod) return json(200, customerSummary);

    const attachedPaymentMethod = await getAttachedCardPaymentMethod(stripeCustomerId);
    return json(200, summarizePaymentMethod(attachedPaymentMethod));
  } catch (error) {
    console.error('Failed to retrieve payment method summary', { message: error instanceof Error ? error.message : 'Unknown error' });
    return json(500, { error: 'Unable to retrieve payment method.' });
  }
};

export { summarizePaymentMethod };
