import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const;

function formatPrice(amount: number | null, currency: string) {
  if (amount == null) return 'Custom';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export const handler: Handler = async () => {
  try {
    const prices = await Promise.all(
      TIERS.map(async (tier) => {
        const useUpgradePricing =
  process.env.UPGRADE_2027 === 'Y';

  console.log(`Using ${useUpgradePricing ? 'upgrade' : 'standard'} pricing for tier ${tier}`);  

const priceId = useUpgradePricing
  ? process.env[`UPGRADE_PRICE_ID_${tier}`]
  : process.env[`PRICE_ID_${tier}`];

        if (!priceId) {
          throw new Error(`Missing env var UPGRADE_PRICE_ID_${tier}`);
        }

        const price = await stripe.prices.retrieve(priceId, {
          expand: ['product'],
        });

        const product =
          typeof price.product === 'string' ? null : price.product;

        return {
          tier: tier.toLowerCase(),
          label: tier.charAt(0) + tier.slice(1).toLowerCase(),
          priceId: price.id,
          amount: price.unit_amount,
          currency: price.currency,
          displayPrice: formatPrice(price.unit_amount, price.currency),
          interval: price.recurring?.interval ?? null,
          productName: product?.name ?? null,
          productDescription: product?.description ?? null,
        };
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify({ prices }),
    };
  } catch (err) {
    console.error('Pricing error:', err);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Unable to load pricing',
      }),
    };
  }
};