import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

type CurrentUser = { clients?: Array<{ stripe_customer_id?: string | null }> };

function cors() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'authorization,content-type,x-idempotency-key',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
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

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors(), body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  try {
    const user = await getAuthenticatedUser(event.headers.authorization || event.headers.Authorization);
    if (!user) return json(401, { error: 'Authentication is required.' });

    const stripeCustomerId = user.clients?.[0]?.stripe_customer_id;
    if (!stripeCustomerId || !stripeCustomerId.startsWith('cus_')) {
      return json(404, { error: 'No Stripe customer is associated with this account.' });
    }

    const setupIntent = await stripe.setupIntents.create(
      {
        customer: stripeCustomerId,
        usage: 'off_session',
        payment_method_types: ['card'],
      },
      { idempotencyKey: event.headers['x-idempotency-key'] as string | undefined }
    );

    if (!setupIntent.client_secret) {
      console.error('SetupIntent created without a client secret', { setupIntentId: setupIntent.id });
      return json(500, { error: 'Unable to start payment method update.' });
    }

    return json(200, { clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Failed to create SetupIntent', { message: error instanceof Error ? error.message : 'Unknown error' });
    return json(500, { error: 'Unable to start payment method update.' });
  }
};
