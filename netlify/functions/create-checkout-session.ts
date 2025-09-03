// netlify/functions/create-checkout-session.ts
import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import crypto from 'node:crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

// server-side whitelist
const PRICE_BY_PLAN: Record<string,string> = {
  gold: process.env.PRICE_ID_GOLD!,
  silver: process.env.PRICE_ID_SILVER!,
  bronze: process.env.PRICE_ID_BRONZE!,
  trial: process.env.PRICE_ID_TRIAL!, // if you use it
};

function sign(input: string) {
  return crypto.createHmac('sha256', process.env.PRECHECKOUT_SECRET!).update(input).digest('hex');
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors(), body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { email, plan, context } = JSON.parse(event.body || '{}');
    if (!email || !plan || !PRICE_BY_PLAN[plan]) {
      return { statusCode: 400, headers: cors(), body: 'Bad request' };
    }

    console.log(`Received checkout session request for ${email}, plan ${plan}, context ${context}`);

    // OPTIONAL: verify captcha token here

    const price = PRICE_BY_PLAN[plan];
    const nonce = crypto.randomUUID();
    const exp = Math.floor(Date.now() / 1000) + 15 * 60; // 15 min
    const sig = sign(`${email}.${plan}.${nonce}.${exp}`);

    const successBase =
  context === 'wizard'
    ? process.env.WIZARD_SUCCESS_URL
    : process.env.UPGRADE_SUCCESS_URL;

    console.log(`Creating checkout session for ${email}, plan ${plan}, price ${price} ${successBase}`);

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer_email: email,
        customer_creation: "always",            // or: customer_creation: 'always'
        payment_intent_data: {
            setup_future_usage: 'off_session', // ← save for future backend charges
        },
        line_items: [{ price, quantity: 1 }],
        success_url: `${successBase}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.CANCEL_URL!,
        // minimal, non-sensitive metadata
        metadata: { email, plan, nonce, exp: String(exp), sig },
      },
      { idempotencyKey: event.headers['x-idempotency-key'] as string | undefined }
    );

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...cors() }, body: JSON.stringify({ sessionId: session.id }) };
  } catch {
    return { statusCode: 500, headers: cors(), body: 'Internal error' };
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'content-type,x-idempotency-key',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };
}
