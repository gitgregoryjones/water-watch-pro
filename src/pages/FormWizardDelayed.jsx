import React, { useEffect, useRef, useState } from 'react';
import Toggle from '../components/Toggle';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import WorkingDialog from '../components/WorkingDialog';
import { Link, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import api from '../utility/api';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../utility/UserSlice';
import { loginUser, patchClient, postClient } from '../utility/loginUser';
import { VITE_PAYMENT_LINK_GOLD, VITE_PRICE_ID_GOLD, VITE_PRICE_ID_BRONZE,VITE_PRICE_ID_SILVER,VITE_PRICE_ID_TRIAL,VITE_STRIPE_SUCCESS_URL,VITE_STRIPE_CANCEL_URL } from '../utility/constants';
import { validatePassword, validateEmail } from '../utility/passwordFunc';
import Stripe from 'stripe';
import Prices from './Prices';
import { abandon, newTrialSignUp } from '../utility/abandon';



const FormWizardDelayed = () => {
  const isNavigating = useRef(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const hasMounted = useRef(false);

  
  const user = useSelector((state) => state.userInfo.user);
  const stripe = new Stripe(VITE_PAYMENT_LINK_GOLD);

  const [searchParams] = useSearchParams();
  const sessionParam = searchParams.get('session');

  //console.log(`Session is ${VITE_PAYMENT_LINK_GOLD}`)

  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);



  const [currentStep, setCurrentStep] = useState(sessionParam != '' ? 1 : 4);
  const [showMsg,setShowMsg] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name:'',
    phone: '',
    termsAccepted: false,
    smsAccepted:false,
    accountType: 'self',
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    subscriptionLevel: 'paid',
    tier: '',
    locationName: '',
    latitude: '',
    longitude: '',
    threshold: '0.5',
    rapidrain: '',

  });

  

  const [errors,setErrors] = useState("")
  const [success,setSuccess] = useState("")

  const toggleVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

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

  useEffect(() => {
    // Handle the beforeunload event
    const handleBeforeUnload = async (event) => {

      
      formData.metadata = {...formData};
      console.log(`This is a form preservation marshaling ${formData}`)
      if (!isNavigating.current) {
        console.log(`Form Data Marshaling: ${JSON.stringify({...formData})}`)
        event.preventDefault();  
        
       
        
        event.returnValue = ""; // Required for modern browsers to display the default prompt
      }
    };

    // Handle the unload event
    const handleUnload =  () => {
      if (!isNavigating.current) {        
        console.log("Current Chose again to leave or reload the page.");
        console.log(`I know this about you ${JSON.stringify(formData)}`)        
        //abandon({...formData}, null)
        
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []); 


useEffect(()=>{
    console.log(`The location is ${location.state?.account_type}`)
    if(location.state?.account_type){
      setFormData({ subscriptionLevel:location.state.account_type })
    } else if(queryParams.get('account_type')){
      //setFormData({..fo})
      setFormData({ subscriptionLevel:queryParams.get("account_type")})
    }

    const b = async function(){
    //wwp_session = user id
    if(sessionParam){
      console.log(`The user is now ${JSON.stringify(user)}`)
      
      //get the stripe session_id for the account from the record and see if they have paid, if so, forward to step 4.  If not, forward to stripe to complete payment      
      //Read Stripe Session Id from record
      //Contact Stripe.  If complete, go to step 4.  If not, forward to Stripe with the same session id
      //If we have a valid session, then we can complete the transaction, otherwise send them to the payment page
      if(sessionParam && !hasMounted.current){
        //do Stripe Lookup and if complete go to step 4, otherwise go to stripe
        setShowMsg(true)
        setCurrentStep(4)

        let sessionDetails = await retrieveSession(sessionParam)

        
        console.log(`Who's the customer  ${JSON.stringify(sessionDetails.customer)} `)

        console.log(`Now time to create a DB user, client and Location and login`)

       //Do Lookup to make sure session is complete, Otherwise Allow the logic to fall through to create a new session and try again
       if(sessionDetails.status == "complete"){
        //setCurrentStep(4)
        console.log(`This would take us to the dashboard because the account are setup`)
        // Step 2: Get the Customer ID from the Session
        const customerId = sessionDetails.customer;

        if (!customerId) {
        console.log('No customer associated with this session.');
        return;
        }

        // Step 3: Retrieve the Customer Details
        const customer = await stripe.customers.retrieve(customerId);

        // Step 4: Access Metadata
        const customerMetadata = customer.metadata;
        console.log('Customer Metadata:', customerMetadata);

        let r = provisionAccount(customerMetadata,customer.email)

        console.log(`Has Mounted is now true ${hasMounted.current}  and r is ${JSON.stringify(r)}`)

        if(r.errors){
            console.log(`I think there are errors`)
            setErrors(r.errors)
            setShowMsg(false)
          
            return;
          
        } else {
            console.log(`I think there are NOT errors`)
            setErrors('Successfully Registered')
            isNavigating.current = true;
            setTimeout(()=> navigate("/"),1500)
            //navigate("/")
           
        }

       console.log('Done doing work')

        hasMounted.current = true;
        return;
 
       } 
        
      } else {
        setShowMsg(false)
        console.log(`I FELL THROUGH`)
        setCurrentStep(1)
    }
      
    }
     
    }
    b();

  

},[])
  
  
 /* const provisionAccount = async (customerMetadata, customer_email) => {
  let txn = {};

  try {
    console.log("Trying to add User");

    // Step 1: Add User
    const aResponse = await addUser({ ...customerMetadata, email: customer_email });

    if (!aResponse?.data) {
      txn.errors = aResponse.errors[0];
      setErrors(txn.errors);
      setShowMsg(false);
      return txn;
    }

    // Step 2: Log in as the new user
    const lresponse = await loginUser(customer_email, customerMetadata.password);

    if (lresponse.errors.length > 0) {
      txn.errors = lresponse.errors;
      setErrors(txn.errors);
      return txn;
    }

    const accessToken = lresponse.userData.accessToken;
    localStorage.setItem("accessToken", accessToken); // Save the new token
    api.defaults.headers.Authorization = `Bearer ${accessToken}`; // Update Axios default headers

    // Step 3: Add the location
    const theLocation = await addLocation(customerMetadata);

    console.log(`The location data is ${JSON.stringify(theLocation)}`);

    const userCopy = { ...lresponse.userData, locations: [theLocation.data] };

    dispatch(updateUser(userCopy));
  } catch (e) {
    txn.errors = e.message;
    console.log(`Failed to provision account ${e.message}`);
  }

  return txn;
}; */


const provisionAccount = async (customerMetadata, customer_email) => {
    let txn = {};
  
    try {
      console.log("Trying to add User");
  
      // Step 1: Add User
      const aResponse = await addUser({ ...customerMetadata, email: customer_email });
  
      if (!aResponse?.data) {
        txn.errors = aResponse.errors[0];
        setErrors(txn.errors);
        setShowMsg(false);
        return txn;
      }
  
      // Step 2: Log in as the new user
      const lresponse = await loginUser(customer_email, customerMetadata.password);
  
      if (lresponse.errors.length > 0) {
        txn.errors = lresponse.errors;
        setErrors(txn.errors);
        return txn;
      }
  
      const accessToken = lresponse.userData.accessToken;
      localStorage.setItem("accessToken", accessToken); // Save the new token
      api.defaults.headers.Authorization = `Bearer ${accessToken}`; // Update Axios default headers
  
      // Step 3: Add the location
      const theLocation = await addLocation(customerMetadata);
  
      console.log(`The location data is ${JSON.stringify(theLocation)}`);
  
      let userCopy = { ...lresponse.userData, locations: [theLocation.data] };

      let savedClient = lresponse.userData?.clients[0]
      
              let newClient =  {...savedClient, tier: customerMetadata.tier, is_trial_account: customerMetadata.subscriptionLevel == "trial",account_type: customerMetadata.subscriptionLevel, status:'active' }
      
              //Gene Business Rules
              newClient.daily_report_on = true;
              newClient.exceed24h_on = true;
              newClient.exceed24h_combine_locations = true;
      
              //Only Gold
             
              if(newClient.tier == "gold"){        
                newClient.forecast_on = true;
                newClient.forecast_combine_locations = true;
              }
      
              if(newClient.tier == "gold" || newClient.tier == "silver"){
                newClient.atlas14_on = true;
                newClient.atlas14_24h_on = true;
                newClient.atlas14_1h_on = true;
                newClient.atlas14_first_on = true;
                newClient.rapidrain_on = true;
                newClient.rapidrain_combine_locations = true;
              }
             
              //If not bronze, overwrite client
              await patchClient(newClient)
      
             // let tmpUserCopy = {...lresponse.userData};
      
              userCopy.clients = [newClient];
      
              //dispatch(updateUser(userCopy));
      
  
      dispatch(updateUser(userCopy));
    } catch (e) {
      txn.errors = e.message;
      console.log(`Failed to provision account ${e.message}`);
    }
  
    return txn;
  };
  


 /* const addUser = async (obj)=>{

  let loginResponse = {};

  let newUser = {
    password: obj.password,
    email: obj.email,
    phone: obj.phone,
    is_verified:false,
    role:"client",
    first_name: obj.first_name || "NotFoundFirst",
    last_name: obj.last_name  || "NotFoundLast",
    agree_to_terms: obj.termsAccepted,
    agree_to_privacy_policy : obj.smsAccepted
    
}

  try {     
      // Step 1: Log in to get the access token

     

      loginResponse = await api.post(`/auth/register`,(newUser))

      return loginResponse;
      //return newUser;
      
      
  }catch(e){
      
      //setErrors(e.message)
      setShowMsg(false)
      //console.log(JSON.stringify(e))
      loginResponse.errors = [e.message]
      return  loginResponse;
  }

} */

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
      // Step 1: Register the user
      loginResponse = await api.post(`/auth/register`, newUser);
  
      // Step 2: Save the access token from the response to localStorage
      const { access_token: accessToken } = loginResponse.data;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.Authorization = `Bearer ${accessToken}`; // Update Axios default headers
      }
  
      return loginResponse;
    } catch (e) {
        setShowMsg(false)
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
    } catch (e) {
      setErrors(e.message);
      return null;
    }
  };
  

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
        if (!validateEmail(formData.email)) {
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

        let msgs = validatePassword(formData.password, formData.confirmPassword)

        if(msgs.length > 0){
          setErrors(msgs[0])
          return false;
        }

        if(!formData.termsAccepted){
            setErrors('Please accept the terms')
            return false;
        }
        /*
        if(!formData.smsAccepted){
            setErrors('Please accept the sms terms')
            return false;
        }*/
        return true;
        break;
    case 2:
        //console.log(`Found the second case...continuing`)
        return true;
        break;
   
    case 3:
        if(!formData.locationName){
            setErrors('Location name is required')
            return;
        }

        if(!formData.longitude){
            setErrors('Longitude is required')
            return;
        }else {
          if(formData.longitude > 0 ){
            formData.longitude = -(formData.longitude);
            
          }
        }

        if(!formData.latitude ){
            setErrors('Latitude is required')
            return;
        }

        if(formData.latitude < 24 || formData.latitude > 49 ){
            setErrors('Latitude must be between 24 and 49 degrees')
            return;
        }

        if(formData.longitude < -124 || formData.longitude > -66 ){
            setErrors('Longitude must be between -124 and -66 degrees')
            return;
        }
       
        if(![0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4].includes(parseFloat(formData.threshold))){
            setErrors(`24 hour Threshold must be one of 0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4 `)
            return;
        }

       /*
        if(user.clients[0]?.tier == "bronze"){
            formData.rapidrain = formData.threshold;
            
        } else */
        if(!formData.rapidrain){
          formData.rapidrain = formData.threshold;
          
          
      } else
        if(![0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4].includes(parseFloat(formData.rapidrain))){
            setErrors(`Rapidrain Threshold must be one of 0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4 `)
            return;
        }
        return true;
        break;

  
      default:
        return true;
    }
  };

  const retrieveSession = async (sessionId)=> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);


      
      //console.log('Session Details:', session);
      return session;
    } catch (error) {
      console.error('Error retrieving session:', error);
      throw error;
    }
  }


  const getPriceTier = (tier, subscriptionLevel)=>{

    

    let pTier = VITE_PRICE_ID_GOLD;

    switch(tier){
      case "gold":
        pTier = VITE_PRICE_ID_GOLD;
      break;
    
    case "silver":
        pTier = VITE_PRICE_ID_SILVER;
      break;
    case "bronze":
      pTier = VITE_PRICE_ID_BRONZE;
      break;
        
      default:
      pTier = VITE_PRICE_ID_BRONZE;
      break;
    }

    console.log(`Returning price ${pTier} for account type ${tier}`)

    if(subscriptionLevel == "trial"){
      console.log(`User wants a free 30 day trial because tier is ${tier}  and subscription type is ${subscriptionLevel} `)
      pTier = VITE_PRICE_ID_TRIAL;
    }

    return pTier;
  }

  const createSession = async ()=>{

    let sessionT = {};
    
    if(formData.subscriptionLevel != "trial") {

    
        const customer = await stripe.customers.create({
            email: formData.email,
            name: `${formData.first_name} ${formData.last_name}`,
            metadata: {
            tier: formData.tier,
            first_name: formData.first_name,
            last_name: formData.last_name,
            password: formData.password,
            phone:formData.phone,
            smsAccepted:formData.smsAccepted,
            termsAccepted:formData.termsAccepted,
            subscriptionLevel:formData.subscriptionLevel,
            locationName: formData.locationName,
            latitude: formData.latitude,
            longitude: formData.longitude,
            threshold: formData.threshold,
            rapidrain: formData.rapidrain,
            }
        });   


     sessionT = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: getPriceTier(formData.tier,formData.subscriptionLevel),
          quantity: 1,
        },
      ],
      
      //customer_email: formData.email, // Pre-fill email field
      customer:customer.id,
      metadata: {
        customer_name: `${formData.first_name} ${formData.last_name}`, // Pass the name as metadata   
        tier: formData.tier,
        password: formData.password,
        phone:formData.phone,
        smsAccepted:formData.smsAccepted,
        termsAccepted:formData.termsAccepted,
        subscriptionLevel:formData.subscriptionLevel,
        locationName: formData.locationName,
        latitude: formData.latitude,
        longitude: formData.longitude,
        threshold: formData.threshold,
        rapidrain: formData.rapidrain,
        
      },
      mode: 'payment' ,
      custom_fields: [
        {
            key: 'alternate_billing_email',
            label: {
                type: 'custom',
                custom: `Billing Email Address`,
            },
            type: "text",
            optional: true,
        },
    ],
      //customer_creation:"always",
      payment_intent_data :{
        setup_future_usage : 'off_session'
      },
      success_url: VITE_STRIPE_SUCCESS_URL,
      cancel_url: VITE_STRIPE_CANCEL_URL,
    });
  } else {

    console.log(`Creating a NEW CUSTOMER!!!`)

    let r = await provisionAccount(formData,formData.email)

    sessionT.url = "/dashboard"
    sessionT.errors = r.errors;
    
  }
    console.log(`Leaving session T`)
    console.log(sessionT)

    return sessionT;
  }
  

  const handleSubmit = async () => {
    //console.log(`Inside submit`)
    setShowMsg(true)
    setErrors(null);
    //console.log(`After submit`)
    if (validateStep()) {

      if(currentStep == 3){
       
        let session = await createSession()

        console.log(`I will send this to Stripe ${JSON.stringify(formData)}  session ${JSON.stringify(session)}`)

        setShowMsg(false)
        isNavigating.current = true;

        try {
        if(formData.subscriptionLevel  == "trial"){

          formData.metadata = {...formData}
          delete formData.metadata.password;
          delete formData.metadata.companyName;
          delete formData.metadata.companyEmail;
          delete formData.metadata.companyPhone;
          delete formData.metadata.accountType;

          await newTrialSignUp(formData,session.id)
        }

        window.location = session.url;
      } catch(e){
        setErrors(e.message.indexOf("properties of undefined") > -1 ? "Account Creation was successful but failed to send welcome email." : e.message)
      }



      }
    } else {
        setShowMsg(false)
    }

   //console.log(`Leaving Submit....`)
  }

  return (
    <div
  className="w-full mt-8 md:mt-0 md:max-w-[60%]  mx-auto bg-gradient-to-br from-white to-[green] shadow-md md:rounded-xl relative"
  
>
        
    <h1 className="p-4  h-[6rem] flex flex-col items-end text-4xl font-bold  md:rounded-t-xl text-[black]  justify-around "><img className="w-[65%] self-start" src="/logo.png"/></h1>
    <div className='flex justify-end m-4 text-3xl'>{currentStep != 4 ? 'Register':`Welcome ${user.first_name}`}</div>
    
    <div className='text-xl text-[red] m-2 mx-6'>{errors}</div>
    <div className='text-xl text-[black] m-2'>{success}</div>
    <div className='p-6 bg-[white]'>
      {currentStep < 3 && (<div className="flex w-full justify-between mb-4">
        <span className='capitalize'>Step {currentStep} of 3 for new {formData.subscriptionLevel} account</span>
        
       { <Link to="/">I already have a login</Link>}
      </div>)}
{currentStep == 3 && <div className='flex justify-center items-center p-2 m-2 border-2 text-md  bg-[#128CA6] text-[white]'>Create your first location to begin using WaterWatchPro </div>}
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
              autocomplete="off"
            />
            
            </div>
          
          <div className="mb-4">
            <label className="block text-gray-700">Password <span className='text-[red]'>*</span></label>
            <div className='flex  items-center justify-center flex-col' >
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
                style={{
                  position: 'absolute',
                  right: '3rem',
                 
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: passwordVisible ? '#333' : '#888',
                }}
              >
              {passwordVisible ? <i class="fa-solid fa-eye-slash"></i> : <i class="fa-solid fa-eye"></i>}
             </span>
            </div>
            <div className='mt-2'>Password must contain at least one capital letter, digit, special character</div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password <span className='text-[red]'>*</span></label>
            <div className='flex  items-center justify-center flex-col' >
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
                style={{
                  position: 'absolute',
                  right: '3rem',
                  
                  
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: passwordVisible ? '#333' : '#888',
                }}
              >
              {passwordVisible ? <i class="fa-solid fa-eye-slash"></i> : <i class="fa-solid fa-eye"></i>}
             </span>
            </div>
            <div className='mt-2'>Password must contain at least one capital letter, digit, special character</div>
          </div>
          
          </div>
          <div className='mt-4 border rounded-2xl p-4'>
          <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Contact Information </h2>
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
          <div className='flex gap-2 justify-between'>
          <div className="mt-4 mb-4">
            <label className="flex gap-2 items-start justify-start block text-gray-700">
              <input
                type="checkbox"
                name="termsAccepted"
                required
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <a href="https://drive.google.com/file/d/15j0YmwgK4UsPKo3FfTj3jpTdCEF5X75J/view" target="_top">I agree to the terms and conditions</a>
            </label>
          </div>
          <div className="mt-4 mb-4">
            <label className="flex gap-2 items-start justify-start block text-gray-700">
              <input
                type="checkbox"
                name="smsAccepted"
                required
                checked={formData.smsAccepted}
                onChange={handleChange}
              />
              <a href="" target="_top">I agree to receive texts and email notifications (optional) 
              </a>
            </label>
          </div>
          </div>
        </div>
      )}

      

      {currentStep === 2 && (

        <div className='border rounded-2xl p-4 mb-4'>
          <h2 className="hidden text-xl font-bold mb-4">Subscription Level </h2>
          {formData.subscriptionLevel === "trial" && <div className="font-normal mb-4 text-lg text-[black]">
            Thanks for your interest in starting a trial WaterWatch PRO account. During the trial, our system will monitor one location and send you daily reports and threshold notifications for 30 days at the <a href="https://www.waterwatchpro.com/rapidrain">Gold</a> service level.
            <p className='mt-2'>Questions? Contact us at support@waterwatchpro.com</p>
            <p className='mt-2'>When the trial ends, you can upgrade for continued use.
You can also choose to upgrade now by sliding the toggle below to “Upgrade Now".</p>
</div> }
          <div className="mb-4 flex items-start ">
            
            <Toggle
              checked={formData.subscriptionLevel === 'paid'}
              onChange={() =>
                setFormData({ ...formData, subscriptionLevel: formData.subscriptionLevel === 'trial' ? 'paid' : 'trial' })
              }
            />
            
            <span className="ml-2 font-bold ">{formData.subscriptionLevel === 'trial' ? <span className='text-lg font-bold'>Upgrade Now</span> : <div className='flex flex-col w-full gap-2 items-start justify-end'><span className='pt-2'>Paid</span><span>Slide to the left to switch to a 30-day trial account</span></div>}</span>
          </div>
          {formData.subscriptionLevel === "trial"  && <div>Otherwise, click “Next” to continue with the trial registration.</div>}
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
   
            {formData.subscriptionLevel === "paid" && <div className="text-[green] font-normal mb-4 text-lg">
               
                <Prices isSmall={true}/>

            </div>}
        </div>
      )}

      {currentStep === 3 && (
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
    24-Hour Threshold (inches)
  </label>
  <div className='m-2 text-sm  italic'>When detected hourly rainfall exceeds this value, you and your contacts will receive text and email notifications.
  </div>
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
{(formData.tier === "gold" || formData.tier === "silver") && (
  <div className="mb-4">
    <label htmlFor="rapidrain" className="block text-gray-700 font-bold mb-2">
      RapidRain Threshold (inches)
    </label>
    <div className='m-2 text-sm  italic'>When detected 15-minute rainfall exceeds this value, you and your contacts will receive text and email notifications. Ideal for pulling samples in a timely fashion. Learn more <a href="https://www.waterwatchpro.com/rapidrain">here</a>
    </div>
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

{currentStep == 4 && (
         <div className='border rounded-2xl p-4 mb-4'>
        <div className="bg-white  p-8">
        
        <h1 className="text-3xl font-bold text-green-800 mb-4">Almost Done</h1>
        <p className="text-lg text-gray-700 mb-6">
          Configuring your account.  You will be redirected to the login page in a moment. Please wait...
        </p>
       
        
      </div>
      </div>

      )}

      {(<div className="flex justify-between">
        { currentStep > 1 && currentStep != 4 && (
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
                if(currentStep < 3){
                    handleNext()
                } else {
                    //console.log(`Trying to Submit`)
                   handleSubmit();
                  
                }
            }}
          >
            {currentStep < 2 ? 'Next' : 'Next'} <FaChevronRight />
          </button>
        )}
        
      </div>)}
      
      </div>
      <WorkingDialog showDialog={showMsg}/>
    </div>
  );
};

export default FormWizardDelayed;
