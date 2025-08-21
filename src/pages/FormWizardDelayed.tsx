import React, { useEffect, useRef, useState } from 'react';
import Toggle from '../components/Toggle';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import WorkingDialog from '../components/WorkingDialog';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../utility/api';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../utility/UserSlice';
import { loginUser, patchClient } from '../utility/loginUser';

import { validatePassword, validateEmail } from '../utility/passwordFunc';
import Prices from './Prices';
import { abandon, newTrialSignUp } from '../utility/abandon';
import { useFeatureFlags } from "@geejay/use-feature-flags";
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const NETLIFY_FUNC_BASE = '/.netlify/functions';



const FormWizardDelayed = () => {
  const isNavigating = useRef(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userInfo.user);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const sessionParam = searchParams.get('session_id'); // Stripe returns ?session_id=...

  const [currentStep, setCurrentStep] = useState(sessionParam ? 4 : 1);
  const [showMsg, setShowMsg] = useState(false);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");

  const { isActive } = useFeatureFlags();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const toggleVisibility = () => setPasswordVisible(!passwordVisible);

  const uuid = () =>
  (self.crypto?.randomUUID ? self.crypto.randomUUID()
                           : `${Date.now()}-${Math.random().toString(16).slice(2)}`);


  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    termsAccepted: false,
    smsAccepted: false,
    accountType: 'self',
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    subscriptionLevel: 'paid', // or 'trial'
    tier: '',
    locationName: '',
    latitude: '',
    longitude: '',
    threshold: '0.5',
    rapidrain: '',
  });

  // preserve / warn on unload
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isNavigating.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const handleUnload = () => {
      if (!isNavigating.current) {
        // abandon({...formData}, null)
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  // handle account_type from location or query
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    const accountType = location.state?.account_type || qp.get('account_type');
    if (accountType) {
      setFormData(prev => ({ ...prev, subscriptionLevel: accountType }));
    }
  }, [location]);

  // Success return from Stripe: finalize the session and provision
  useEffect(() => {
    if (!sessionParam) return;

    const finalize = async () => {
      try {
        setShowMsg(true);
        const headers = {
          'Content-Type': 'application/json'
        
        };
        const resp = await fetch(`${NETLIFY_FUNC_BASE}/finalize-checkout-session`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ sessionId: sessionParam }),
        });
        if (!resp.ok) throw new Error('Failed to finalize Stripe session');
        const sessionDetails = await resp.json(); // safe subset per function
        if (sessionDetails.status !== 'paid') { setErrors('Payment not settled'); return; }

        // Rehydrate info we DIDN'T send to Stripe (e.g., password) from sessionStorage
        const cached = JSON.parse(sessionStorage.getItem('signup.cache') || '{}');

        // Provision account with your API using the combined data
        const meta = {
          ...cached, // contains password, names, phone, thresholds, etc.
          // also include Stripe linkage from finalize payload:
          stripe_customer_id: sessionDetails.customerId,
          stripe_session_id: sessionDetails.sessionId,
          tier: cached.tier || sessionDetails?.metadata?.plan_tier,
          subscriptionLevel: cached.subscriptionLevel || sessionDetails?.metadata?.subscription_level,
        };

        const r = await provisionAccount(meta, meta.email);
        if (r.errors) {
          setErrors(r.errors);
          setShowMsg(false);
          return;
        }

        setErrors('');
        setSuccess('Successfully Registered');
        isNavigating.current = true;
        sessionStorage.removeItem('signup.cache');
        setTimeout(() => navigate("/"), 1200);
      } catch (e) {
        setErrors((e as Error).message || 'Failed to finalize order');
        setShowMsg(false);
      }
    };

    finalize();
  }, [sessionParam, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleToggle = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name] === 'self' ? 'company' : 'self',
    }));
  };

  const handleNext = () => {
    setErrors("");
    if (validateStep()) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrors("");
    setCurrentStep(prev => prev - 1);
  };

  const validateStep = () => {
    setErrors("");
    switch (currentStep) {
      case 1: {
        if (!formData.first_name) return setErr('First name is required.');
        if (!formData.last_name) return setErr('Second name is required.');
        if (!formData.email) return setErr('Email is required.');
        if (!validateEmail(formData.email)) return setErr('Please enter a valid email address.');
        if (!formData.phone) return setErr('Phone number is required.');
        const phonePattern = /^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/;
        if (!phonePattern.test(formData.phone)) return setErr('Please enter a valid phone number.');
        if (!formData.password || !formData.confirmPassword) return setErr('Please fill in both password fields.');
        if (formData.password !== formData.confirmPassword) return setErr('Passwords do not match.');
        const msgs = validatePassword(formData.password, formData.confirmPassword);
        if (msgs.length > 0) return setErr(msgs[0]);
        if (!formData.termsAccepted) return setErr('Please accept the terms');
        return true;
      }
      case 2:
        return true;
      case 3: {
        if (!formData.locationName) return setErr('Location name is required');
        if (!formData.longitude && formData.longitude !== 0) return setErr('Longitude is required');
        if (!formData.latitude && formData.latitude !== 0) return setErr('Latitude is required');
        const lon = Number(formData.longitude);
        const lat = Number(formData.latitude);
        if (lat < 24 || lat > 49) return setErr('Latitude must be between 24 and 49 degrees');
        const fixedLon = lon > 0 ? -lon : lon;
        if (fixedLon < -124 || fixedLon > -66) return setErr('Longitude must be between -124 and -66 degrees');
        if (![0.01,0.1,0.25,0.5,0.75,1.0,1.5,2,3,4].includes(parseFloat(formData.threshold)))
          return setErr('24 hour Threshold must be one of 0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4');

        const rr = formData.rapidrain || formData.threshold;
        if (![0.01,0.1,0.25,0.5,0.75,1.0,1.5,2,3,4].includes(parseFloat(rr)))
          return setErr('Rapidrain Threshold must be one of 0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4');

        // persist normalized lon + rr into state
        setFormData(prev => ({ ...prev, longitude: fixedLon, rapidrain: rr }));
        return true;
      }
      default:
        return true;
    }

    function setErr(msg) { setErrors(msg); return false; }
  };



  const createSession = async () => {
  // Trial path stays local
  if (formData.subscriptionLevel === "trial") {
    const r = await provisionAccount(formData, formData.email);
    return { url: "/dashboard", errors: r.errors };
  }

  // Cache fields we must NOT send to Stripe
  sessionStorage.setItem('signup.cache', JSON.stringify({
    email: formData.email,
    password: formData.password,
    first_name: formData.first_name,
    last_name: formData.last_name,
    phone: formData.phone,
    smsAccepted: formData.smsAccepted,
    termsAccepted: formData.termsAccepted,
    subscriptionLevel: formData.subscriptionLevel,
    tier: formData.tier,
    locationName: formData.locationName,
    latitude: formData.latitude,
    longitude: formData.longitude,
    threshold: formData.threshold,
    rapidrain: formData.rapidrain,
  }));

  // 👇 tokenless: just send email + plan
  const res = await fetch(`${NETLIFY_FUNC_BASE}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': uuid()
    },
    body: JSON.stringify({
      email: formData.email,
      plan: formData.tier, // "gold" | "silver" | "bronze"
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to create Checkout session');
  }
  const data = await res.json(); // { sessionId }
  return { sessionId: data.sessionId };
};


  const handleSubmit = async () => {
    setShowMsg(true);
    setErrors(null);

    if (!validateStep()) { setShowMsg(false); return; }

    if (currentStep === 3) {
      try {
        const session = await createSession();
        setShowMsg(false);
        isNavigating.current = true;

        if (formData.subscriptionLevel === "trial") {
          const s = await newTrialSignUp(formData);
          window.location = session.url;
          return;
        }

        // Refactor path: redirect to Stripe with Stripe.js
        const stripeJs = await stripePromise;
        await stripeJs?.redirectToCheckout({ sessionId: session.sessionId });
      } catch (e) {
        const msg = (e.message || '').includes('properties of undefined')
          ? "Account Creation was successful but failed to send welcome email."
          : (e.message || 'Submission failed');
        setErrors(msg);
        setShowMsg(false);
      }
    }
  };

  // === Business-specific helpers you already had ===

  const provisionAccount = async (customerMetadata, customer_email) => {
    let txn = {};
    try {
      // 1) Register user
      const aResponse = await addUser({ ...customerMetadata, email: customer_email });
      if (!aResponse?.data) {
        txn.errors = aResponse.errors?.[0] || 'Registration failed';
        setErrors(txn.errors);
        setShowMsg(false);
        return txn;
      }

      // 2) Login
      const lresponse = await loginUser(customer_email, customerMetadata.password);
      if (lresponse.errors?.length > 0) {
        txn.errors = lresponse.errors;
        setErrors(txn.errors);
        return txn;
      }

      const accessToken = lresponse.userData.accessToken;
      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;

      // 3) Create first location
      const theLocation = await addLocation(customerMetadata);

      let userCopy = { ...lresponse.userData, locations: [theLocation?.data] };
      let savedClient = lresponse.userData?.clients?.[0];

      let newClient = {
        ...savedClient,
        stripe_customer_id: customerMetadata.stripe_customer_id,
        stripe_session_id: customerMetadata.stripe_session_id,
        tier: customerMetadata.tier,
        is_trial_account: customerMetadata.subscriptionLevel === "trial",
        account_type: customerMetadata.subscriptionLevel,
        status: 'active',
        // Defaults / feature toggles
        daily_report_on: true,
        exceed24h_on: true,
        exceed24h_combine_locations: true,
        only_show_locations_with_non_zero: true,
        sort_by_rainfall: true,
      };

      if (newClient.tier === "gold") {
        newClient.forecast_on = true;
        newClient.forecast_combine_locations = true;
      }
      if (newClient.tier === "gold" || newClient.tier === "silver") {
        newClient.atlas14_on = true;
        newClient.atlas14_24h_on = true;
        newClient.atlas14_1h_on = true;
        newClient.atlas14_first_on = true;
        newClient.rapidrain_on = true;
        newClient.rapidrain_combine_locations = true;
        newClient.rapidrain_first_on = true;
      }

      await patchClient(newClient);
      userCopy.clients = [newClient];
      dispatch(updateUser(userCopy));
    } catch (e: any) {
      txn.errors = e.message;
      console.log(`Failed to provision account ${e.message}`);
    }
    return txn;
  };

  const addUser = async (obj) => {
    let loginResponse = {};
    const newUser = {
      password: obj.password,
      email: obj.email,
      phone: obj.phone,
      is_verified: false,
      role: "client",
      first_name: obj.first_name || "NotFoundFirst",
      last_name: obj.last_name || "NotFoundLast",
      agree_to_terms: obj.termsAccepted,
      agree_to_privacy_policy: obj.smsAccepted,
    };
    try {
      loginResponse = await api.post(`/auth/register`, newUser);
      const { access_token: accessToken } = loginResponse.data || {};
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
      }
      return loginResponse;
    } catch (e: any) {
      setShowMsg(false);
      loginResponse.errors = [e.message];
      return loginResponse;
    }
  };

  const addLocation = async (obj) => {
    try {
      const locationResponse = await api.post(`/api/locations`, {
        name: obj.locationName,
        latitude: obj.latitude,
        longitude: obj.longitude,
        status: "active",
        h24_threshold: obj.threshold,
        rapidrain_threshold: obj.rapidrain,
      });
      return locationResponse;
    } catch (e: any) {
      setErrors(e.message);
      return null;
    }
  };

  return (
    <div className="w-full mt-8 md:mt-0 md:max-w-[60%] mx-auto bg-gradient-to-br from-white to-[green] shadow-md md:rounded-xl relative">
      <h1 className="p-4 h-[6rem] flex flex-col items-end text-4xl font-bold md:rounded-t-xl text-[black] justify-around ">
        <img className="w-[65%] self-start" src="/logo.png" />
      </h1>

      <div className='flex justify-end m-4 text-3xl'>
        {currentStep !== 4 ? 'Register' : `Welcome ${user?.first_name || ''}`}
      </div>

      <div className='text-xl text-[red] m-2 mx-6'>{errors}</div>
      <div className='text-xl text-[black] m-2'>{success}</div>

      <div className='p-6 bg-[white]'>
        {currentStep < 3 && (
          <div className="flex w-full justify-between mb-4">
            <span className='capitalize'>Step {currentStep} of 3 for new {formData.subscriptionLevel} account</span>
            <Link to="/">I already have a login</Link>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <div className='border rounded-2xl p-4'>
              <h2 className="text-xl font-bold mb-4">User Details</h2>

              <div className="mb-4">
                <label className="block">Email <span className='text-[red]'>*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="mb-4">
                <label className="block">Password <span className='text-[red]'>*</span></label>
                <div className='flex items-center justify-center flex-col relative'>
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    placeholder='Password (at least 8 characters)'
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-2"
                    required
                  />
                  <span
                    onClick={toggleVisibility}
                    style={{ position: 'absolute', right: '3rem', cursor: 'pointer', fontSize: '20px' }}
                  >
                    {passwordVisible ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                  </span>
                </div>
                <div className='mt-2'>Password must contain at least one capital letter, digit, special character</div>
              </div>

              <div className="mb-4">
                <label className="block">Confirm Password <span className='text-[red]'>*</span></label>
                <div className='flex items-center justify-center flex-col relative'>
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    placeholder='Password (at least 8 characters)'
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-2"
                    required
                  />
                  <span
                    onClick={toggleVisibility}
                    style={{ position: 'absolute', right: '3rem', cursor: 'pointer', fontSize: '20px' }}
                  >
                    {passwordVisible ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                  </span>
                </div>
                <div className='mt-2'>Password must contain at least one capital letter, digit, special character</div>
              </div>
            </div>

            <div className='mt-4 border rounded-2xl p-4'>
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                <label className="block">Name <span className='text-[red]'>*</span></label>
                <div className='flex gap-4'>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full border border-gray-300 rounded p-2" placeholder='Enter First Name' required />
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full border border-gray-300 rounded p-2" placeholder='Enter Last Name' required />
                </div>
              </div>

              <div className="mb-4">
                <label className="block">Phone <span className='text-[red]'>*</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded p-2" placeholder='(XXX) XXX-XXXX' required />
              </div>
            </div>

            <div className='flex gap-2 justify-between'>
              <div className="mt-4 mb-4">
                <label className="flex gap-2 items-start">
                  <input type="checkbox" name="termsAccepted" required checked={formData.termsAccepted} onChange={handleChange} />
                  <a href="https://drive.google.com/file/d/15j0YmwgK4UsPKo3FfTj3jpTdCEF5X75J/view" target="_top">I agree to the terms and conditions</a>
                </label>
              </div>
              <div className="mt-4 mb-4">
                <label className="flex gap-2 items-start">
                  <input type="checkbox" name="smsAccepted" checked={formData.smsAccepted} onChange={handleChange} />
                  <span>I agree to receive texts and email notifications (optional)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className='border rounded-2xl p-4 mb-4'>
            {formData.subscriptionLevel === "trial" && (
              <div className="font-normal mb-4 text-lg">
                Thanks for your interest in a trial WaterWatch PRO account…
              </div>
            )}

            <div className="mb-4 flex items-start">
              <Toggle
                checked={formData.subscriptionLevel === 'paid'}
                onChange={() =>
                  setFormData(prev => ({ ...prev, subscriptionLevel: prev.subscriptionLevel === 'trial' ? 'paid' : 'trial' }))
                }
              />
              <span className="ml-2 font-bold ">
                {formData.subscriptionLevel === 'trial'
                  ? <span className='text-lg font-bold'>Upgrade Now</span>
                  : <div className='flex flex-col w-full gap-2 items-start'><span className='pt-2'>Paid</span><span>Slide to switch to a 30-day trial</span></div>}
              </span>
            </div>

            {formData.subscriptionLevel === 'paid' && (
              <>
                <div className="mb-4">
                  <label className="block">Tier</label>
                  <div className="flex gap-4">
                    {['gold', 'silver', 'bronze'].map((tier) => (
                      <label key={tier}>
                        <input type="radio" name="tier"  value={tier} checked={formData.tier === tier} onChange={handleChange} className='mx-2' />
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="text-[green] font-normal mb-4 text-lg">
                  <Prices isSmall={true} />
                </div>
              </>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className='border rounded-2xl p-4 mb-4'>
            <h2 className="text-xl font-bold mb-4">Monitored Location</h2>

            <div className="mb-4">
              <label className="block">Location Name <span className='text-[red]'>*</span></label>
              <input type="text" name="locationName" value={formData.locationName} onChange={handleChange} className="w-full border border-gray-300 rounded p-2" required />
            </div>
            <div className="mb-4">
              <label className="block">Latitude <span className='text-[red]'>*</span></label>
              <input type="number" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full border border-gray-300 rounded p-2" required />
            </div>
            <div className="mb-4">
              <label className="block">Longitude <span className='text-[red]'>*</span></label>
              <input type="number" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full border border-gray-300 rounded p-2" required />
            </div>

            <div className="mb-4">
              <label htmlFor="threshold" className="block font-bold mb-2">24-Hour Threshold (inches)</label>
              <div className='m-2 text-sm italic'>
                When detected hourly rainfall exceeds this value…
              </div>
              <select id="threshold" name="threshold" value={formData.threshold} onChange={handleChange} className="border border-gray-300 rounded p-2 w-full" required>
                <option value="">-- Select Threshold --</option>
                {[0.01,0.1,0.25,0.5,0.75,1.0,1.5,2,3,4].map((o) => (
                  <option value={o} key={o}>{o}</option>
                ))}
              </select>
            </div>

            {(formData.tier === "gold" || formData.tier === "silver") && (
              <div className="mb-4">
                <label htmlFor="rapidrain" className="block font-bold mb-2">RapidRain Threshold (inches)</label>
                <div className='m-2 text-sm italic'>
                  When detected 15-minute rainfall exceeds this value…
                </div>
                <select id="rapidrain" name="rapidrain" value={formData.rapidrain} onChange={handleChange} className="border border-gray-300 rounded p-2 w-full" required>
                  <option value="">-- Select Threshold --</option>
                  {[0.01,0.1,0.25,0.5,0.75,1.0,1.5,2,3,4].map((o) => (
                    <option value={o} key={o}>{o}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className='border rounded-2xl p-4 mb-4'>
            <div className="bg-white p-8">
              <h1 className="text-3xl font-bold text-green-800 mb-4">Almost Done</h1>
              <p className="text-lg mb-6">
                Configuring your account. You will be redirected to the dashboard in a moment. Please wait...
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          {currentStep > 1 && currentStep !== 4 && (
            <button className="flex items-center justify-center bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={handleBack}>
              <FaChevronLeft /> Back
            </button>
          )}
          {currentStep < 4 && (
            <button
              className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => {
                if (currentStep < 3) handleNext();
                else handleSubmit();
              }}
            >
              {currentStep < 2 ? 'Next' : 'Next'} <FaChevronRight />
            </button>
          )}
        </div>
      </div>

      <WorkingDialog showDialog={showMsg} />
    </div>
  );
};

export default FormWizardDelayed;
