// netlify/functions/stripe-webhook.ts
import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import crypto from 'node:crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const PRECHECKOUT_SECRET = process.env.PRECHECKOUT_SECRET!;

// same sign func as above
function sign(s: string) {
  return crypto.createHmac('sha256', PRECHECKOUT_SECRET).update(s).digest('hex');
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const sig = event.headers['stripe-signature'] as string;
    const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '';
    const evt = stripe.webhooks.constructEvent(raw, sig, endpointSecret);

    if (evt.type === 'checkout.session.completed') {
      const session = evt.data.object as Stripe.Checkout.Session;
      const md = session.metadata || {};
      const email = session.customer_details?.email || md.email;

      // Verify our HMAC & expiration (anti-tamper)
      const ok =
        md.email && md.plan && md.nonce && md.exp &&
        sign(`${md.email}.${md.plan}.${md.nonce}.${md.exp}`) === md.sig &&
        Number(md.exp) >= Math.floor(Date.now() / 1000);

      if (!ok) {
        console.warn('metadata integrity check failed');
        return { statusCode: 400, body: 'Bad metadata' };
      }

      // TODO: upsert user (found by email), attach plan, mark paid
      // send "set password" / magic link email
      // store stripe_customer_id, session.id, plan, etc.
    }

    return { statusCode: 200, body: 'ok' };
  } catch {
    return { statusCode: 400, body: 'Invalid signature' };
  }
};
