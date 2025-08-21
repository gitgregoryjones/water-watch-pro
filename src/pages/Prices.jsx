// src/pages/Prices.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { updateUser } from '../utility/UserSlice';
import { convertTier, patchClient } from '../utility/loginUser';
import { loadStripe } from '@stripe/stripe-js';



const NETLIFY_FUNC_BASE = '/.netlify/functions';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Prices({ isSmall = false }) {
  const user = useSelector((state) => state.userInfo.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // --- Upgrade → create Checkout Session via Netlify function ---
  const handleUpgrade = async (tier) => {
    try {
      if (!user?.email) {
        console.error('No user email available');
        return;
      }

      const res = await fetch(`${NETLIFY_FUNC_BASE}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': uuid(),
        },
        body: JSON.stringify({
          email: user.email,
          plan: tier, // "gold" | "silver" | "bronze"
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Failed to create Checkout session');
      }

      const { sessionId } = await res.json();
      const stripeJs = await stripePromise;
      const { error } = await stripeJs.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to start upgrade checkout:', err);
    }
  };

  // --- After returning from Stripe on success page (expects ?session_id=cs_...) ---
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    // Prefer the official key; also support legacy "?session=" and malformed double-?" cases
    let sessionId = searchParams.get('session_id') || searchParams.get('session');
    if (!sessionId && typeof window !== 'undefined') {
      const m = window.location.href.match(/[?&]session_id=([^&?#]+)/);
      if (m) sessionId = m[1];
    }
    if (!sessionId || isSmall) return;

    const processStripeSession = async () => {
      try {
        const resp = await fetch(`${NETLIFY_FUNC_BASE}/finalize-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        if (!resp.ok) throw new Error('Failed to finalize Stripe session');
        const session = await resp.json(); // { status, metadata, customerId, sessionId, ... }

        // Accept "paid" or "no_payment_required" (in case of trials/free invoices)
        if (!['paid', 'no_payment_required'].includes(session.status)) {
          console.error('Payment not settled yet:', session.status);
          return;
        }

        const tier = session?.metadata?.plan || session?.metadata?.plan_tier;
        const customerId = session.customerId;

        // Update client via your API
        const patchResponse = await patchClient({
          tier,
          is_trial_account: false,
          account_type: 'paid',
          stripe_customer_id: customerId,
          stripe_session_id: session.sessionId,
          id: user?.clients?.[0]?.id,
        });

        // Update Redux
        dispatch(
          updateUser({
            ...user,
            tier: convertTier({ clients: [patchResponse.clientData] }),
            clients: [patchResponse.clientData],
          })
        );

        // Optional UI tweaks you had before:
        try {
          document.querySelectorAll('.plan').forEach((el) => {
            if (!el.classList.contains(tier)) el.classList.add('hidden');
          });
          const hdr = document.querySelector('.pricing-header');
          if (hdr) hdr.textContent = 'Congratulations You Subscribed To';
        } catch { /* non-fatal */ }

        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (error) {
        console.error('Error processing Stripe session:', error);
      }
    };

    processStripeSession();
  }, [location.search, isSmall, dispatch, navigate, user]);

  const features = [
    { name: '24/7 Monitoring', gold: true, silver: true, bronze: true },
    { name: 'Threshold Notification', gold: true, silver: true, bronze: true },
    { name: 'National Precipitation Forecast', gold: true, silver: true, bronze: true },
    { name: 'Daily and Monthly Reports', gold: true, silver: true, bronze: false },
    { name: 'Previous Month Report Only', gold: false, silver: false, bronze: true },
    { name: 'Contact Notifications', gold: true, silver: true, bronze: true },
    { name: 'Excessive Rainfall', gold: true, silver: true, bronze: false },
    { name: 'RapidRain', gold: true, silver: true, bronze: false },
    { name: 'Configurable RapidRain Thresholds', gold: true, silver: true, bronze: false },
    { name: 'Site-Specific Forecasts', gold: true, silver: false, bronze: false },
    { name: 'On-Demand Lookup', gold: true, silver: false, bronze: false },
  ];

  const renderFeatures = (plan) =>
    features.map((feature, idx) =>
      feature[plan] ? (
        <li key={idx} className="flex items-center space-x-2">
          <span className="text-green-500 font-bold">✔</span>
          <span>{feature.name}</span>
        </li>
      ) : null
    );

  return (
    <div className="w-full p-6 pt-6 bg-gradient-to-br from-white to-gray-100 rounded-lg max-w-6xl shadow-md md:rounded-xl">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800 pricing-header">
        Monthly Subscription Pricing
      </h2>

      {!isSmall && (
        <Link
          to={location.state?.url ? location.state.url : params.get('ref') ? params.get('ref') : "/client-form"}
          state={{ client: user?.clients?.[0], myself: !user?.is_superuser }}
          className="flex justify-end items-center px-4 mb-4"
        >
          Not Now
        </Link>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Gold */}
        <div className="plan gold flex flex-col items-center justify-center border border-yellow-400 rounded-lg p-6 bg-yellow-50 shadow-md">
          <h3 className="text-xl font-bold text-yellow-700 mb-2">Gold</h3>
          <p className="text-4xl font-bold text-gray-800 mb-2">$24.00</p>
          <p className="text-gray-600 text-sm text-center">per 5 locations</p>
          <ul className="mt-4 space-y-2 text-gray-700">{renderFeatures('gold')}</ul>
          {!isSmall && (
            <button
              onClick={() => handleUpgrade('gold')}
              className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              Upgrade
            </button>
          )}
        </div>

        {/* Silver */}
        <div className="plan silver flex flex-col items-center justify-start border border-gray-400 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-700 mb-2">Silver</h3>
          <p className="text-4xl font-bold text-gray-800 mb-2">$18.00</p>
          <p className="text-gray-600 text-sm text-center">per 5 locations</p>
          <ul className="mt-4 space-y-2 text-gray-700">{renderFeatures('silver')}</ul>
          {!isSmall && (
            <button
              onClick={() => handleUpgrade('silver')}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Upgrade
            </button>
          )}
        </div>

        {/* Bronze */}
        <div className="plan bronze flex flex-col items-center justify-start border border-orange-400 rounded-lg p-6 bg-orange-50 shadow-md">
          <h3 className="text-xl font-bold text-orange-700 mb-2">Bronze</h3>
          <p className="text-4xl font-bold text-gray-800 mb-2">$12.00</p>
          <p className="text-gray-600 text-sm text-center">per 5 locations</p>
          <ul className="mt-4 space-y-2 text-gray-700">{renderFeatures('bronze')}</ul>
          {!isSmall && (
            <button
              onClick={() => handleUpgrade('bronze')}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 text-gray-700 text-sm md:text-base leading-6">
        <p className="mb-4">
          Once you make your initial payment, you can add as many locations as you want to pay for. During the next billing cycle, your recurring subscription cost is based on the number of locations in your account and service level.
        </p>
        <p className="font-semibold text-gray-800 text-center">
          Your card will automatically be charged on the renewal date.
        </p>
      </div>
    </div>
  );
}
