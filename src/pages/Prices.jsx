import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// Stripe Price IDs from your environment variables
const STRIPE_PRICE_IDS = {
  gold: "bIY8zqaCyg38ehGcMM",
  silver: "bIYg1SbGCbMS3D2aEF",
  bronze: "8wMaHycKG2cigpO8wy",
};
//const user = useSelector((state) => state.userInfo.user);

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

export default function Prices({isSmall = false}) {
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

  const handleUpgrade = (priceId) => {
    // Redirect to Stripe Checkout URL
    window.location.href = `https://buy.stripe.com/test_${priceId}`;
  };

  return (
    <div className="w-full p-6 pt-6 bg-gradient-to-br from-white to-gray-100 rounded-lg max-w-6xl shadow-md md:rounded-xl">
      {!isSmall && <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
        Subscription Pricing
      </h2>}
      {!isSmall && <div className='flex w-full justify-end m-4 px-8'><a  href="#" onClick={()=>history.go(-1)} to={"/dashboard"}>Not Now Thanks</a></div>}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Gold Plan */}
        <div className=" flex flex-col items-center justify-center border border-yellow-400 rounded-lg p-6 bg-yellow-50 shadow-md">
          <h3 className="text-xl font-bold text-yellow-700 mb-2">Gold</h3>
          <p className="text-4xl font-bold text-gray-800 mb-2">$24.00</p>
          <p className="text-gray-600 text-sm text-center">
            Base charge to initialize service
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">{!isSmall && renderFeatures('gold')}</ul>
          {!isSmall && <button
            onClick={() => handleUpgrade(STRIPE_PRICE_IDS.gold)}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Upgrade
          </button>}
        </div>

        {/* Silver Plan */}
        <div className="opacity-100 flex flex-col items-center justify-center border border-gray-400 rounded-lg p-6 bg-gray-50 shadow-md">
          <h3 className="text-xl font-bold text-gray-700 mb-2">Silver</h3>
          <p className="text-4xl font-bold text-gray-800 mb-2">$18.00</p>
          <p className="text-gray-600 text-sm text-center">
            Base charge to initialize service
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">{!isSmall && renderFeatures('silver')}</ul>
          {!isSmall && <button
            onClick={() => handleUpgrade(STRIPE_PRICE_IDS.silver)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Upgrade
          </button>}
        </div>

        {/* Bronze Plan */}
        <div className=" flex flex-col items-center justify-center border border-orange-400 rounded-lg p-6 bg-orange-50 shadow-md">
          <h3 className="text-xl font-bold text-orange-700 mb-2">Bronze</h3>
          <p className="text-4xl font-bold text-gray-800 mb-2">$12.00</p>
          <p className="text-gray-600 text-sm text-center">
            Base charge to initialize service
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">{!isSmall && renderFeatures('bronze')}</ul>
          {!isSmall && <button
            onClick={() => handleUpgrade(STRIPE_PRICE_IDS.bronze)}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          >
            Upgrade
          </button>}
        </div>
      </div>

      <div className="mt-8 text-gray-700 text-sm md:text-base leading-6">
        <p className="mb-4">
          Once you make your initial payment, you can add as many locations as
          you want to pay for. During the next billing cycle, your recurring
          subscription cost is based on the number of locations in your account
          and service level.
        </p>
        <p className="font-semibold text-gray-800 text-center">
          Your card will automatically be charged on the renewal date.
        </p>
      </div>
    </div>
  );
}
