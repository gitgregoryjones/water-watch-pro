import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { VITE_STRIPE_UPGRADE_SUCCESS_URL, VITE_STRIPE_CANCEL_URL,VITE_PRICE_ID_GOLD,VITE_PRICE_ID_SILVER,VITE_PRICE_ID_BRONZE,VITE_PAYMENT_LINK_GOLD } from '../utility/constants';
import api from '../utility/api';
import { convertTier, loginUser, patchClient } from '../utility/loginUser';
import { updateUser } from '../utility/UserSlice';
import Stripe from 'stripe';

export default function Prices({ isSmall = false }) {
  const user = useSelector((state) => state.userInfo.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Stripe Price IDs from your environment variables
  const STRIPE_PRICE_IDS = {
    gold: VITE_PRICE_ID_GOLD,
    silver: VITE_PRICE_ID_SILVER,
    bronze: VITE_PRICE_ID_BRONZE,
  };

const stripe = new Stripe(VITE_PAYMENT_LINK_GOLD);

const handleUpgrade = async (tier) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: STRIPE_PRICE_IDS[tier],
                    quantity: 1,
                },
            ],
            customer_creation:"always",
            
            customer_email: user.email,
            payment_intent_data :{
              setup_future_usage :'off_session'
            },
            metadata: {
                customer_name: `${user.first_name} ${user.last_name}`,
                tier,
            },
            mode:'payment',
            
            
            success_url: VITE_STRIPE_UPGRADE_SUCCESS_URL,
            cancel_url: VITE_STRIPE_CANCEL_URL,
        });

        window.location.href = session.url;
    } catch (error) {
        console.error('Failed to create Stripe session:', error);
    }
};

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session');

    const processStripeSession = async () => {
      if (!sessionId || isSmall) return;

      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const { tier } = session.metadata;
            const customerId = session.customer;

            console.log(`Session complete is ${JSON.stringify(session)}`)

            // Update client data
            const patchResponse = await patchClient({
                tier,
                is_trial_account: false,
                account_type: 'paid',
                stripe_customer_id: customerId,
                stripe_session_id: session.id,
                id:user.clients[0].id
            });

            // Re-authenticate user
            //const loginResponse = await loginUser(user.email, user.password);

            // Update Redux state
            dispatch(
                updateUser({
                    ...user,
                    tier: convertTier({clients:[patchResponse.clientData]}),
                    clients: [patchResponse.clientData],
                })
            );

            // Update UI and redirect
            document.querySelectorAll('.plan').forEach((el) => {
                if (!el.classList.contains(tier)) {
                    el.classList.add('hidden');
                }
            });
            document.querySelector('.pricing-header').textContent = 'Congratulations You Subscribed To';

            setTimeout(() => {
                navigate('/dashboard');
            }, 5000);
        }
    } catch (error) {
        console.error('Error processing Stripe session:', error);
    }
    };

    processStripeSession();
  }, [location.search, user.email, user.password, dispatch, navigate]);

  const features = [
    { name: '24/7 Monitoring', gold: true, silver: true, bronze: true },
    { name: 'Threshold Notification', gold: true, silver: true, bronze: true },
    { name: 'National Precipitation Forecast', gold: true, silver: true, bronze: true },
    { name: 'Daily and Monthly Reports', gold: true, silver: true, bronze: true },
    { name: 'Contact Notifications', gold: true, silver: true, bronze: true },
    { name: 'Excessive Rainfall', gold: true, silver: true, bronze: false },
    { name: 'RAPID-RAIN', gold: true, silver: true, bronze: false },
    { name: 'Site-Specific Forecasts', gold: true, silver: false, bronze: false },
    { name: 'On-Demand Lookup', gold: true, silver: false, bronze: false },
  ];

  const renderFeatures = (plan) =>
    features.map((feature, index) => {
      if (feature[plan]) {
        return (
          <li key={index} className="flex items-center space-x-2">
            <span className="text-green-500 font-bold">✔</span>
            <span>{feature.name}</span>
          </li>
        );
      }
      return null;
    });

  return (
    <div className="w-full p-6 pt-6 bg-gradient-to-br  from-white to-gray-100 rounded-lg max-w-6xl shadow-md md:rounded-xl">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800 pricing-header">
        Monthly Subscription Pricing
      </h2>
      {!isSmall && <Link to="/client-form" state={{client:user.clients[0], myself:!user.is_superuser}} className="flex justify-end items-center px-4 mb-4">Not Now</Link>}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Gold Plan */}
        <div className="plan gold flex flex-col items-center justify-center border border-yellow-400 rounded-lg p-6 bg-yellow-50 shadow-md">
          <h3 className="text-xl font-bold text-yellow-700 mb-2">Gold</h3>
          <p className="text-4xl font-bold text-gray-800 mb-2">$24.00</p>
          <p className="text-gray-600 text-sm text-center">per 5 locations</p>
          <ul className="mt-4 space-y-2 text-gray-700">{renderFeatures('gold')}</ul>
          {!isSmall && <button
            onClick={() => handleUpgrade('gold')}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Upgrade
          </button>}
        </div>

        {/* Silver Plan */}
        <div className="plan silver flex flex-col items-center justify-start border border-gray-400 rounded-lg p-6 bg-gray-50 shadow-md">
          <h3 className="text-xl font-bold text-gray-700 mb-2">Silver</h3>
          <p className="text-4xl font-bold text-gray-800 mb-2">$18.00</p>
          <p className="text-gray-600 text-sm text-center">per 5 locations</p>
          <ul className="mt-4 space-y-2 text-gray-700">{renderFeatures('silver')}</ul>
          {!isSmall &&<button
            onClick={() => handleUpgrade('silver')}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Upgrade
          </button>}
        </div>

        {/* Bronze Plan */}
        <div className="plan bronze flex flex-col items-center justify-start border border-orange-400 rounded-lg p-6 bg-orange-50 shadow-md">
          <h3 className="text-xl font-bold text-orange-700 mb-2">Bronze</h3>
          <p className="text-4xl font-bold text-gray-800 mb-2">$12.00</p>
          <p className="text-gray-600 text-sm text-center">per 5 locations</p>
          <ul className="mt-4 space-y-2 text-gray-700">{renderFeatures('bronze')}</ul>
          {!isSmall && <button
            onClick={() => handleUpgrade('bronze')}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          >
            Upgrade
          </button>}
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
