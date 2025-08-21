// netlify/functions/finalize-checkout-session.ts
import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { sessionId } = JSON.parse(event.body || '{}');
    if (!sessionId) return { statusCode: 400, body: 'Missing sessionId' };

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items.data.price.product'] });

    // DO NOT provision here; just return info for the page
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        status: session.payment_status,
        email: session.customer_details?.email,
        plan: session.metadata?.plan,
      }),
    };
  } catch {
    return { statusCode: 500, body: 'Internal error' };
  }
};
