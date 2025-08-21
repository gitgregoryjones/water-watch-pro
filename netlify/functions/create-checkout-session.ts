// netlify/functions/create-checkout-session.ts
import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export const handler: Handler = async (event, context) => {
  // CORS/preflight (optional—safe to keep)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization,content-type,x-idempotency-key',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // ✅ Netlify Identity auth
    // Make sure your client sends the token:
    // const token = (await netlifyIdentity.currentUser()?.jwt())  or
    // const token = netlifyIdentity.currentUser()?.token?.access_token
    // fetch('/.netlify/functions/create-checkout-session', { headers: { Authorization: `Bearer ${token}` } })
    const user = context.clientContext?.user;
    if (!user) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const { price, metadata, success_url, cancel_url } = JSON.parse(event.body || '{}');
    if (!price || !success_url || !cancel_url) {
      return { statusCode: 400, body: 'Missing fields' };
    }

    const uid = (user as any).sub || (user as any).id; // sub is the stable subject claim
    const email = (user as any).email as string | undefined;

    // Find or create a Stripe Customer for this Netlify Identity user
    const search = await stripe.customers.search({
      query: `metadata['netlify_uid']:'${uid}'`,
    });

    let customer = search.data[0];
    if (!customer) {
      customer = await stripe.customers.create({
        email,
        metadata: { netlify_uid: uid },
      });
    }

    const idempotencyKey =
      (event.headers['x-idempotency-key'] as string) ||
      (event.headers['X-Idempotency-Key'] as string) ||
      undefined;

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer: customer.id,
        line_items: [{ price, quantity: 1 }],
        success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url,
        // Keep this minimal & non-sensitive
        metadata: {
          netlify_uid: uid,
          plan_tier: metadata?.plan_tier,
          subscription_level: metadata?.subscription_level,
          location_name: metadata?.location_name,
        },
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // adjust to your domain if needed
      },
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (e) {
    // Avoid leaking details
    return { statusCode: 500, body: 'Internal error' };
  }
};
