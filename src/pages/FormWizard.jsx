import React, { useState } from 'react';
import Toggle from '../components/Toggle';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import WorkingDialog from '../components/WorkingDialog';
import { Link } from 'react-router-dom';

const FormWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showMsg,setShowMsg] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    termsAccepted: false,
    accountType: 'self',
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    subscriptionLevel: 'paid',
    tier: 'gold',
    locationName: '',
    latitude: '',
    longitude: '',
    threshold: '0.5',
    rapidRain: '',
  });

  const [errors,setErrors] = useState("")
  const [success,setSuccess] = useState("")

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleToggle = (name) => {
    setFormData({
      ...formData,
      [name]: formData[name] === 'self' ? 'company' : 'self',
    });
  };

  const handleNext = () => {
    setErrors("")
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrors("")
    setCurrentStep((prev) => prev - 1);
  };


  

  const validateStep = () => {
    switch (currentStep) {
      case 1: // User Details Validation
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
          setErrors('Please fill all required fields.');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrors('Passwords do not match.');
          return false;
        }
        return true;
      case 4: // Monitored Location Validation
        if (!formData.locationName || !formData.latitude || !formData.longitude) {
          setErrors('Please fill all required fields.');
          return false;
        }
        if (formData.latitude < -90 || formData.latitude > 90) {
          setErrors('Latitude must be between -90 and 90.');
          return false;
        }
        if (formData.longitude < -180 || formData.longitude > -66) {
          setErrors('Longitude must be between -180 and -66.');
          return false;
        }
        return true;
      default:
        setErrors(false)
        return true;
    }
  };

  const handleSubmit = () => {
    setShowMsg(true)
    if (validateStep()) {
      
      console.log('Form Submitted:', formData);
      setTimeout(()=>{

      setSuccess('Sign-up successful!'); window.location.href = "/"},500)
    } else {
        setShowMsg(false)
    }
  };

  return (
    <div
  className="w-full mt-8 md:mt-0 md:max-w-[50%] mx-auto bg-gradient-to-br from-white to-[green] shadow-md md:rounded-xl relative"
  
>
        
    <h1 className="p-4  h-[6rem] flex flex-col items-end text-4xl font-bold  md:rounded-t-xl text-[black]  justify-around "><img className="w-[65%] self-start" src="http://localhost:5173/src/assets/logo.png"/><div>Register</div></h1>
    
    <div className='text-xl text-[red] m-2 mx-6'>{errors}</div>
    <div className='text-xl text-[black] m-2'>{success}</div>
    <div className='p-6 bg-[white]'>
      <div className="flex w-full justify-between mb-4">
        Step {currentStep} of 4
        
        <Link to="/">I already have a login</Link>
      </div>

      {currentStep === 1 && (
        <div className=''>
        <div className='border rounded-2xl p-4'>
          <h2 className="text-xl font-bold mb-4">User Details</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
            </div>
          
          <div className="mb-4">
            <label className="block text-gray-700">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          </div>
          <div className='mt-4 border rounded-2xl p-4'>
          <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <label className="block text-gray-700">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          </div>
          <div className="mt-4 mb-4">
            <label className="flex gap-2 items-start justify-start block text-gray-700">
              <input
                type="checkbox"
                name="termsAccepted"
                required
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              I agree to the terms and conditions
            </label>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className='border rounded-2xl p-4 mb-4'>
        <div>
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="flex gap-2 mb-4 items-center text-lg justify-start">
           
             <input
              type="radio"
              name="accountType"
              value={"self"}
              onChange={handleChange}
              className=" border border-gray-300 rounded p-2"
              checked={formData.accountType === 'self'}
              required
              
            />
            <span>Individual</span>
            <input
              type="radio"
              name="accountType"
              value={"Company"}
              onChange={handleChange}
              className=" border border-gray-300 rounded p-2"
              checked={formData.accountType !== 'self'}
              required
              
            />
            <span>Company</span>
            
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">{formData.accountType === "self" ? "Individual" : formData.accountType} Name *</label>
           {formData.accountType != "self" ? <input
              type="text"
              name="companyName"
              value={formData.accountType == "self" ? formData.name : formData.companyName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
              
            /> : <input
            type="text"
            name="companyName"
            value={formData.accountType == "self" ? formData.name : formData.companyName}
            onChange={handleChange}
            className="w-full border border-gray-300  bg-slate-200 rounded p-2"
            
            readonly
            
          />}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone *</label>
            {formData.accountType != "self" ? <input
              type="tel"
              name="companyPhone"
              value={formData.accountType == "self" ? formData.phone : formData.companyPhone}
              onChange={handleChange}
              className="w-full border border-gray-300  rounded p-2"
              required
            /> : <input
            type="tel"
            name="companyPhone"
            value={formData.accountType == "self" ? formData.phone : formData.companyPhone}
            onChange={handleChange}
            className="w-full border border-gray-300 bg-slate-200 rounded p-2"
            required
            readOnly
          />}
          </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (

        <div className='border rounded-2xl p-4 mb-4'>
          <h2 className="text-xl font-bold mb-4">Subscription Level</h2>
          <div className="mb-4">
            <Toggle
              checked={formData.subscriptionLevel === 'paid'}
              onChange={() =>
                setFormData({ ...formData, subscriptionLevel: formData.subscriptionLevel === 'trial' ? 'paid' : 'trial' })
              }
            />
            <span className="ml-2">{formData.subscriptionLevel}</span>
          </div>
          {formData.subscriptionLevel === 'paid' && (
            <div className="mb-4">
              <label className="block text-gray-700">Tier</label>
              <div className="flex gap-4">
                {['gold', 'silver', 'bronze'].map((tier) => (
                  <label key={tier}>
                    <input
                      type="radio"
                      name="tier"
                      value={tier}
                      checked={formData.tier === tier}
                      onChange={handleChange}
                      className='mx-2'
                    />
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          )}
            {formData.subscriptionLevel === "trial" && <div className="font-normal mb-4 text-lg text-[green]">
            Thanks for your interest in starting a trial WaterWatch PRO account. During the trial, our system will monitor one location and send you daily reports and threshold notifications for 30 days at the Gold service level (link back to the Prices section of the WWP website). Questions? Contact us at support@waterwatchpro.com 
            </div>}
            {formData.subscriptionLevel === "paid" && <div className="text-[green] font-normal mb-4 text-lg">
                Thanks for your interest in starting a monthly subscription to WaterWatch PRO. Select a service level and enter as many locations as you wish. Billing is based on the number of your locations and the service level (link back to the Prices section of the WWP website).  
Questions? Contact us at support@waterwatchpro.com. 
            </div>}
        </div>
      )}

      {currentStep === 4 && (
        <div className='border rounded-2xl p-4 mb-4'>
          <h2 className="text-xl font-bold mb-4">Monitored Location</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Location Name *</label>
            <input
              type="text"
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Latitude *</label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Longitude *</label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
          <label htmlFor="threshold" className="block text-gray-700 font-bold mb-2">
            24-Hour Rain Threshold (inches)
          </label>
          <select
            
            
            id="h24Threshold"
            value={formData.threshold}
            onChange={(e) => {handleChange}}
            className="border border-gray-300 rounded p-2 w-full"
            required
          >
                 <option value="">-- Select Threshhold --</option>
           {[.01, .1, .25, .5, .75, 1.0, 1.5, 2, 3, 4].map((o,i)=>{
                return <option value={o} key={i}>{o}</option>
            })
            }
            </select>
        </div>

        {/* RapidRain Threshold */}
        {formData.tier == "gold" && ( <div className="mb-4">
          <label htmlFor="rapidrain" className="block text-gray-700 font-bold mb-2">
            RapidRain Threshold (inches)
          </label>
          <select
            
            
            id="rapidRainThreshold"
            value={formData.rapidRain}
            onChange={(e) => handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
            
            >
              <option value="">-- Select Threshhold --</option>
          
            {[.01, .1, .25, .5, .75, 1.0, 1.5, 2, 3, 4].map((o,i)=>{
                return <option value={o} key={i}>{o}</option>
            })
            }
            </select>
        </div>)}
        </div>
      )}

      <div className="flex justify-between">
        {currentStep > 1 && (
          <button
            className="flex items-center justify-center bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={handleBack}
          >
            <FaChevronLeft /> Back
          </button>
        )}
        {currentStep < 4 && (
          <button
            className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleNext}
          >
            Next <FaChevronRight />
          </button>
        )}
        {currentStep === 4 && (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleSubmit}
          >
            Sign Up
          </button>
        )}
      </div>
      <WorkingDialog showDialog={showMsg}/>
      </div>
    </div>
  );
};

export default FormWizard;
