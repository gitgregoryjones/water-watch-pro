# Update Payment Method

## Frontend flow
Authenticated users open `/update-payment-method` from the Account Actions section. The React page requests a SetupIntent client secret from `/.netlify/functions/create-setup-intent`, mounts Stripe Elements with the Payment Element, and confirms the SetupIntent with `redirect: "if_required"`. The return route is `/payment-method-updated`.

## Backend flow
`create-setup-intent` requires a bearer token, looks up the current user through the existing API (`API_HOST` or `VITE_API_HOST`), reads the trusted `clients[0].stripe_customer_id`, and creates a card-only SetupIntent with `usage: "off_session"`. The browser never supplies a Stripe customer id.

## Environment variables
This feature uses existing variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`, and `API_HOST`/`VITE_API_HOST`. `ALLOWED_ORIGIN` remains the CORS allow-list used by Netlify Functions.

## Webhook event
The existing Stripe webhook handles `setup_intent.succeeded`. It verifies the Stripe signature, retrieves the PaymentMethod, confirms the PaymentMethod customer matches the SetupIntent customer, and updates `customer.invoice_settings.default_payment_method` for future invoices.

## Local and Stripe test-mode testing
Run the app and Netlify Functions locally, forward Stripe webhooks to `/.netlify/functions/stripe-webhook`, then use Stripe test cards in the Payment Element. Use `4242 4242 4242 4242` for a successful card and `4000 0025 0000 3155` for a card that requires authentication. This flow saves a payment method only and does not create a charge.

## Subscription-level defaults
The current codebase only showed customer-level Stripe customer storage and Checkout payment setup. No existing subscription-level `default_payment_method` update path was identified, so this feature updates the customer invoice default only.
