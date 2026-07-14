import { useEffect, useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Card from '../components/Card';
import SettingsMenu from '../components/SettingsMenu';
import { stripePromise } from '../stripePromise';

const NETLIFY_FUNC_BASE = '/.netlify/functions';

const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#128CA6',
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    colorDanger: '#dc2626',
    fontFamily: 'Roboto, system-ui, sans-serif',
    borderRadius: '10px',
  },
  rules: {
    '.Input': { border: '1px solid #d1d5db', boxShadow: 'none', padding: '12px' },
    '.Input:focus': { borderColor: '#128CA6', boxShadow: '0 0 0 2px rgba(18, 140, 166, 0.15)' },
    '.Label': { fontWeight: '600', color: '#374151' },
  },
};

function PaymentMethodForm({ onSucceeded }) { // eslint-disable-line react/prop-types
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/payment-method-updated`,
      },
    });

    if (error) {
      setMessage(error.message || 'We could not save that payment method. Please try another card.');
      setIsSubmitting(false);
      return;
    }

    if (setupIntent?.status === 'succeeded') {
      onSucceeded();
      return;
    }

    setMessage('Complete any bank authentication prompts to finish updating your payment method.');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {message && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>}
      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="w-full rounded-lg bg-[#128CA6] px-5 py-3 font-bold text-white shadow hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400 md:w-auto"
      >
        {isSubmitting ? 'Saving…' : 'Save payment method'}
      </button>
    </form>
  );
}

export default function UpdatePaymentMethod() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.userInfo.user);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(new URLSearchParams(window.location.search).has('setup_intent'));
  const [acknowledged, setAcknowledged] = useState(success);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (success) {
      setLoading(false);
      return;
    }

    if (!acknowledged) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    async function createSetupIntent() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${NETLIFY_FUNC_BASE}/create-setup-intent`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': crypto.randomUUID?.() || `${Date.now()}`,
          },
          body: JSON.stringify({ flow: 'update-payment-method' }),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to start payment method update.');
        setClientSecret(data.clientSecret);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Unable to start payment method update.');
      } finally {
        setLoading(false);
      }
    }
    createSetupIntent();
    return () => controller.abort();
  }, [acknowledged, success]);

  const options = useMemo(() => clientSecret ? { clientSecret, appearance } : null, [clientSecret]);
  const activeClient = user?.clients?.[0];

  return (
    <div className="h-full w-full flex flex-col mt-28">
      <h1 className="text-2xl font-bold text-green-800 m-8 self-start">Settings &gt; Update payment method</h1>
      <Card header={<SettingsMenu activeTab="mysubscription" />} className="border-[whitesmoke] md:rounded-[unset]">
        <div className="mx-auto w-full max-w-3xl p-6">
          <div className="rounded-2xl border bg-white p-6 shadow-md md:p-8">
            {!acknowledged && !success && (
              <div className="space-y-6">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#128CA6]">Billing authorization</p>
                <h2 className="mb-3 text-3xl font-bold text-gray-900">Confirm Billing Authorization</h2>
                <div className="space-y-3 text-gray-700">
                  <p className="font-semibold">You acknowledge that:</p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>You are authorized by your organization to make billing changes.</li>
                    <li>You understand future subscription charges will use this payment method.</li>
                    <li>WaterWatch PRO does not store your complete credit card information.</li>
                  </ul>
                </div>
                <label className="flex items-start gap-3 rounded-lg border bg-gray-50 p-4 text-gray-800">
                  <input
                    type="checkbox"
                    checked={isAuthorized}
                    onChange={(event) => {
                      setIsAuthorized(event.target.checked);
                      if (event.target.checked) setAcknowledged(true);
                    }}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-[#128CA6] focus:ring-[#128CA6]"
                  />
                  <span className="font-semibold">I confirm I am authorized to update this payment method.</span>
                </label>
                <p className="text-sm text-gray-600">Checking the box will continue to the secure payment form.</p>
              </div>
            )}

            {acknowledged && !success && (
              <>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#128CA6]">Secure billing</p>
                <h2 className="mb-3 text-3xl font-bold text-gray-900">Update payment method</h2>
                <p className="mb-6 text-gray-600">
                  Add a new card for {activeClient?.account_name || 'your account'}. Stripe securely collects the card details, and the new payment method will be used for future payments after it is saved.
                </p>
              </>
            )}

            {acknowledged && loading && <div className="rounded-lg border bg-gray-50 p-4 text-gray-700">Loading secure payment form…</div>}
            {acknowledged && error && (
              <div className="space-y-4">
                <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
                <button onClick={() => window.location.reload()} className="rounded bg-[#128CA6] px-4 py-2 font-bold text-white">Try again</button>
              </div>
            )}
            {success && (
              <div className="space-y-4 rounded border border-green-200 bg-green-50 p-5 text-green-800">
                <h3 className="text-xl font-bold">Payment method saved</h3>
                <p>Your new card was saved securely. It may take a moment for the billing summary to reflect the update.</p>
                <button onClick={() => navigate('/client-form', { state: { client: activeClient, myself: true, paymentMethodSaved: true } })} className="rounded bg-green-700 px-4 py-2 font-bold text-white">Back to account</button>
              </div>
            )}
            {acknowledged && !loading && !error && !success && options && (
              <Elements stripe={stripePromise} options={options}>
                <PaymentMethodForm onSucceeded={() => setSuccess(true)} />
              </Elements>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
