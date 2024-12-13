import React, { useEffect, useState } from 'react';
import Toggle from '../components/Toggle';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import WorkingDialog from '../components/WorkingDialog';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import api from '../utility/api';

const FormWizard = () => {
  const navigate = useNavigate();
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);



  const [currentStep, setCurrentStep] = useState(1);
  const [showMsg,setShowMsg] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name:'',
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
    rapidrain: '',
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

useEffect(()=>{
    console.log(`User passed was ${JSON.stringify(location.state)}`)
    //The User Was Passed, so go to the Location page
  if(location.state){
    setCurrentStep(4);
  }

},[])
  
  
 const addUser = async ()=>{

    try {
        
        // Step 1: Log in to get the access token
        const loginResponse = await api.post(`/auth/register`,({
            password: formData.password,
            email: formData.email,
            phone: formData.phone,
            is_verified:false,
            role:"client",

            first_name: formData.first_name,
            last_name: formData.last_name
            
        }))

        

        console.log(`User registered successfully ${JSON.stringify(loginResponse.data)}`)

        return true;
        
        
    }catch(e){
        console.log(`Encountere errors ${e.message}`)
        setErrors(e.message)
        return;
    }

 }

 const addLocation = async ()=>{

    

    try {
        
        // Step 1: Log in to get the access token
        const locationResponse = await api.post(`/api/locations`,({
            name: formData.locationName,
            latitude: formData.latitude,
            longitude: formData.longitude,
            status: "active",
            h24_threshold:formData.threshold,
            rapidrain_threshold: formData.rapidrain
            
        }))

        console.log(`User registered successfully ${JSON.stringify(locationResponse.data)}`)

        return true;
        
        
    }catch(e){
        console.log(`Encountere errors ${e.message}`)
        setErrors(e.message)
        return;
    }

 }

  const validateStep = () => {
    setErrors("")
    switch (currentStep) {
      case 1: // User Details Validation
        // Email validation
        if (!formData.first_name) {
            setErrors('First name is required.');
            return false;
          }
          if (!formData.last_name) {
            setErrors('Second name is required.');
            return false;
          }
        if (!formData.email) {
          setErrors('Email is required.');
          return false;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
          setErrors('Please enter a valid email address.');
          return false;
        }
  
        // Phone validation
        if (!formData.phone) {
          setErrors('Phone number is required.');
          return false;
        }
        const phonePattern = /^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/;
        if (!phonePattern.test(formData.phone)) {
          setErrors('Please enter a valid phone number.');
          return false;
        }
  
        // Passwords
        if (!formData.password || !formData.confirmPassword) {
          setErrors('Please fill in both password fields.');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrors('Passwords do not match.');
          return false;
        }
        return true;
        break;
    case 2:
        console.log(`Found the second case...continuing`)
        return true;
        break;
   
    case 4:
        if(!formData.locationName){
            setErrors('Location name is required')
            return;
        }

        if(!formData.longitude){
            setErrors('Longitude is required')
            return;
        }

        if(!formData.latitude ){
            setErrors('Latitude is required')
            return;
        }

        if(formData.latitude < 20 || formData.latitude > 55 ){
            setErrors('Latitude must be between 20 and 55 degrees')
            return;
        }

        if(formData.longitude < -125 || formData.longitude > -70 ){
            setErrors('Longitude must be between -125 and -70 degrees')
            return;
        }
       
        if(![0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4].includes(parseFloat(formData.threshold))){
            setErrors(`24 hour Threshold must be one of 0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4 `)
            return;
        }

        if(location.state && location.state.tier != "gold"){
            formData.rapidrain = formData.threshold;
        }

        if(![0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4].includes(parseFloat(formData.rapidrain))){
            setErrors(`24 hour Threshold must be one of 0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4 `)
            return;
        }
        return true;
        break;

  
      default:
        return true;
    }
  };
  

  const handleSubmit = () => {
    console.log(`Inside submit`)
    setShowMsg(true)
    if (validateStep()) {
      
      if(location.state){
        //The state is available after the user logs in.  Now continue setting up the account.  The registration process adds a User and Client record.
        //Now we only need to add a location for this client
        addLocation();
        setShowMsg(false)
        console.log(`Got the user from ${JSON.stringify(location.state.user)} and now save location to the DB ${JSON.stringify(formData)}`)
        setTimeout(()=>{

            setSuccess('location added successfully');navigate('/dashboard')},
           3000);
   
       } else {
        addUser();
        setShowMsg(false)
        setCurrentStep(3)
           setShowMsg(false)
       }
      } 

   
  };

  return (
    <div
  className="w-full mt-8 md:mt-0 md:max-w-[50%] mx-auto bg-gradient-to-br from-white to-[green] shadow-md md:rounded-xl relative"
  
>
        
    <h1 className="p-4  h-[6rem] flex flex-col items-end text-4xl font-bold  md:rounded-t-xl text-[black]  justify-around "><img className="w-[65%] self-start" src="http://localhost:5173/src/assets/logo.png"/><div>{!location.state ? 'Register':`Welcome ${location.state.first_name}`}</div></h1>
    
    <div className='text-xl text-[red] m-2 mx-6'>{errors}</div>
    <div className='text-xl text-[black] m-2'>{success}</div>
    <div className='p-6 bg-[white]'>
      {currentStep < 3 && (<div className="flex w-full justify-between mb-4">
        Step {currentStep} of 4 {location?.state ? `for ${location.state.first_name} ${location.state.last_name}` : ""}
        
       { currentStep < 3 && <Link to="/">I already have a login</Link>}
      </div>)}
{currentStep == 4 && <div className='flex justify-center items-center p-2 m-2 border-2 text-md  bg-[#128CA6] text-[white]'>Create your first location to begin using WaterWatchPro </div>}
      {currentStep === 1 && (
        <div className=''>
        <div className='border rounded-2xl p-4'>
          <h2 className="text-xl font-bold mb-4">User Details</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Email <span className='text-[red]'>*</span></label>
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
            <label className="block text-gray-700">Password <span className='text-[red]'>*</span></label>
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
            <label className="block text-gray-700">Confirm Password <span className='text-[red]'>*</span></label>
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
            <label className="block text-gray-700">Name <span className='text-[red]'>*</span></label>
            <div className='flex gap-4 justify-center items-center'>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder='Enter First Name'
              required
            />
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder='Enter Last Name'
              required
            />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone <span className='text-[red]'>*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2"
              placeholder='(XXX) XXX-XXXX'
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
            <label className="block text-gray-700">Location Name <span className='text-[red]'>*</span></label>
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
            <label className="block text-gray-700">Latitude <span className='text-[red]'>*</span></label>
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
            <label className="block text-gray-700">Longitude <span className='text-[red]'>*</span></label>
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
    id="threshold"
    name="threshold"
    value={formData.threshold}
    onChange={handleChange}
    className="border border-gray-300 rounded p-2 w-full"
    required
  >
    <option value="">-- Select Threshold --</option>
    {[0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4].map((o, i) => (
      <option value={o} key={i}>{o}</option>
    ))}
  </select>
</div>

{/* RapidRain Threshold */}
{formData.tier === "gold" && (
  <div className="mb-4">
    <label htmlFor="rapidrain" className="block text-gray-700 font-bold mb-2">
      RapidRain Threshold (inches)
    </label>
    <select
      id="rapidrain"
      name="rapidrain"
      value={formData.rapidrain}
      onChange={handleChange}
      className="border border-gray-300 rounded p-2 w-full"
      required
    >
      <option value="">-- Select Threshold --</option>
      {[0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4].map((o, i) => (
        <option value={o} key={i}>{o}</option>
      ))}
    </select>
  </div>
)}

        </div>
      )}

      {currentStep == 3 && (
         <div className='border rounded-2xl p-4 mb-4'>
        <div className="bg-white  p-8">
        <img
          src="http://localhost:5173/src/assets/logo.png"
          alt="Site Logo"
          className="w-32 mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold text-green-800 mb-4">Confirm Your Email</h1>
        <p className="text-lg text-gray-700 mb-6">
          We've sent a verification link to your email. Please check your inbox (and spam folder, just in case) to complete the registration process.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="hidden bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            Go to Login
          </Link>
        </div>
        <div className="mt-4">
          <p className="text-gray-600 text-sm">
            Didn’t receive the email?{" "}
            <Link
              to="/resend-verification"
              className="text-green-700 font-bold hover:underline"
            >
              Resend Verification Email
            </Link>
          </p>
        </div>
      </div>
      </div>

      )}

      {currentStep != 3 && (<div className="flex justify-between">
        {currentStep > 1 &&  currentStep < 3 &&  (
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
            onClick={()=> {
                if(currentStep < 2){
                    handleNext()
                } else {
                    console.log(`Trying to Submit`)
                    handleSubmit();
                }
            }}
          >
            {currentStep < 2 ? 'Next' : 'Join'} <FaChevronRight />
          </button>
        )}
        {currentStep === 4 && (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleSubmit}
          >
            Enter
          </button>
        )}
      </div>)}
      <WorkingDialog showDialog={showMsg}/>
      </div>
    </div>
  );
};

export default FormWizard;
