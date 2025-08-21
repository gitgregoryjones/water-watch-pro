// netlify/functions/finalize-checkout-session.ts
import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export const handler: Handler = async (event, context) => {
  // Optional CORS/preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*', // or your domain
        'Access-Control-Allow-Headers': 'authorization,content-type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // ✅ Auth via Netlify Identity
    // Ensure your frontend sends Authorization: Bearer <identity_jwt>
    const user = context.clientContext?.user;
    if (!user) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const { sessionId } = JSON.parse(event.body || '{}');
    if (!sessionId) return { statusCode: 400, body: 'Missing sessionId' };

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer', 'line_items.data.price.product'],
    });

    const netlifyUid =
      session.metadata?.netlify_uid ||
      (typeof session.customer !== 'string' ? session.customer?.metadata?.netlify_uid : null);

    // Netlify Identity stable subject is usually `user.sub`
    const callerUid = (user as any).sub || (user as any).id;
    if (!netlifyUid || netlifyUid !== callerUid) {
      return { statusCode: 403, body: 'Forbidden' };
    }

    const safe = {
      sessionId: session.id,
      status: session.payment_status, // e.g. 'paid'
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
      customerId:
        typeof session.customer === 'string' ? session.customer : session.customer?.id,
      metadata: session.metadata ?? {},
      lineItems:
        session.line_items?.data.map((li) => ({
          quantity: li.quantity,
          priceId: typeof li.price === 'string' ? li.price : li.price?.id,
          productName:
            typeof li.price !== 'string' &&
            typeof li.price?.product !== 'string'
              ? li.price?.product?.name
              : undefined,
          amount_subtotal: li.amount_subtotal,
          amount_total: li.amount_total,
        })) ?? [],
      payment_intent_id:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // or your domain
      },
      body: JSON.stringify(safe),
    };
  } catch {
    return { statusCode: 500, body: 'Internal error' };
  }
};
