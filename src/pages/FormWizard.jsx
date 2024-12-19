import React, { useEffect, useState } from 'react';
import Toggle from '../components/Toggle';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import WorkingDialog from '../components/WorkingDialog';
import { Link, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import api from '../utility/api';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../utility/UserSlice';
import { loginUser, patchClient } from '../utility/loginUser';
import { VITE_PAYMENT_LINK_GOLD, VITE_PRICE_ID_GOLD, VITE_PRICE_ID_BRONZE,VITE_PRICE_ID_SILVER,VITE_PRICE_ID_TRIAL,VITE_STRIPE_SUCCESS_URL,VITE_STRIPE_CANCEL_URL } from '../utility/constants';
import validatePassword from '../utility/passwordFunc';
import Stripe from 'stripe';


const FormWizard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userInfo.user);
  const stripe = new Stripe(VITE_PAYMENT_LINK_GOLD);

  const [searchParams] = useSearchParams();
  const sessionParam = searchParams.get('session');

  //console.log(`Session is ${VITE_PAYMENT_LINK_GOLD}`)

  
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
    smsAccepted:false,
    accountType: 'self',
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    subscriptionLevel: 'trial',
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
    //console.log(`Location passed was ${JSON.stringify(location.state)}`)
    //The User Was Passed, so go to the Location page
    if(location.state?.accountType){
      setFormData({...formData, subscriptionLevel:location.state.account_type })
    }  
    const b = async function(){
    //wwp_session = user id
    if(user.clients[0].status == "pending"){
      console.log(`The user is now ${JSON.stringify(user)}`)
      //get the stripe session_id for the account from the record and see if they have paid, if so, forward to step 4.  If not, forward to stripe to complete payment      
      //Read Stripe Session Id from record
      //Contact Stripe.  If complete, go to step 4.  If not, forward to Stripe with the same session id
      //If we have a valid session, then we can complete the transaction, otherwise send them to the payment page
      if(sessionParam){
        //do Stripe Lookup and if complete go to step 4, otherwise go to stripe

        let sessionDetails = await retrieveSession(sessionParam)

        let localClient = await patchClient({...user.clients[0], stripe_customer_id:sessionDetails.customer})

        console.log(`Who's session is ${JSON.stringify(sessionDetails)} and customer ${JSON.stringify(localClient)}`)

       //Do Lookup to make sure session is complete, Otherwise Allow the logic to fall through to create a new session and try again
       if(sessionDetails.status == "complete"){
        setCurrentStep(4)
        return;

       } 
        
        
      } 

      //fall through logic

      const tryAgainSession = await createSession();

      await patchClient({...user.clients[0], stripe_session_id:tryAgainSession.id})

     // window.location.href = tryAgainSession.url;
      
    }
     
    }
    b();

  

},[])
  
  
 const addUser = async ()=>{

    let loginResponse = {};

    try {     
        // Step 1: Log in to get the access token

       

        loginResponse = await api.post(`/auth/register`,({
            password: formData.password,
            email: formData.email,
            phone: formData.phone,
            is_verified:false,
            role:"client",
            first_name: formData.first_name,
            last_name: formData.last_name
            
        }))

       
        

        
        //console.log(`User registered successfully ${JSON.stringify(loginResponse.data)}`)

        return loginResponse;
        
        
    }catch(e){
        
        setErrors(e.message)
        //console.log(JSON.stringify(e))
        loginResponse.errors = [e.message]
        return  loginResponse;
    }

 }

 

 const addLocation = async ()=>{

    

    try {
        
        // Step 1: Log Add The Location
        const locationResponse = await api.post(`/api/locations`,({
            name: formData.locationName,
            latitude: formData.latitude,
            longitude: formData.longitude,
            status: "active",
            h24_threshold:formData.threshold,
            rapidrain_threshold: formData.rapidrain
            
        }))

        const userData = {...user};

        let theLocation = {...locationResponse.data, lat:locationResponse.data.latitude, lng:locationResponse.data.longitude}

        //Weird formatting on dashboard page.  need to fix this
        theLocation.location = {...locationResponse.data, lat:locationResponse.data.latitude, lng:locationResponse.data.longitude}

        userData.locations = [theLocation]

        

        //console.log(`User registered successfully ${JSON.stringify(userData)}`)

         // Step 1: Log Add The Location
         const clientResponse = await patchClient({
          id:user.clients[0].id,
          status:'active'
          
        })

        userData.clients = [clientResponse.clientData];

        //console.log(`Client Status should be active now ${JSON.stringify(userData)}`)


        dispatch(updateUser(userData));


        return clientResponse.errors;
        
        
    }catch(e){
        //console.log(`Encountere errors ${e.message}`)
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

        let msgs = validatePassword(formData.password, formData.confirmPassword)

        if(msgs.length > 0){
          setErrors(msgs[0])
          return false;
        }

        if(!formData.termsAccepted){
            setErrors('Please accept the terms')
            return false;
        }
        if(!formData.smsAccepted){
            setErrors('Please accept the sms terms')
            return false;
        }
        return true;
        break;
    case 2:
        //console.log(`Found the second case...continuing`)
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

       
        if(formData.tier != "gold"){
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


  const getPriceTier = (userP)=>{

    

    let pTier = VITE_PRICE_ID_GOLD;

    switch(userP.clients[0].tier){
      case "gold":
        pTier = VITE_PRICE_ID_GOLD;
      break;
    
    case "silver":
        pTier = VITE_PRICE_ID_SILVER;
      break;
    case "bronze":
      pTier = VITE_PRICE_ID_BRONZE;
      break;
    case "bronze":
      pTier = VITE_PRICE_ID_TRIAL;
      break;      
      default:
      pTier = VITE_PRICE_ID_GOLD;
      break;
    }

    console.log(`Returning price ${pTier} for account type ${userP.clients[0].account_type}`)

    if(user.clients[0].account_type == "trial"){
      console.log(`User wants a free 30 day trial because tier is ${userP.clients[0].tier}  and subscription type is ${userP.clients[0].account_type} and user is ${JSON.stringify(userP)}`)
      pTier = VITE_PRICE_ID_TRIAL;
    }

    return pTier;
  }

  const createSession = async (userP)=>{

    //console.log(`Trying to get a session for the user T ${user.first_name}`)

    if(!userP){
      userP = user;
    } else {
      console.log(`Using this user!!! ${JSON.stringify(userP)}`)
    }

    let sessionT = {};
    
    if(getPriceTier(userP) != VITE_PRICE_ID_TRIAL) {
     sessionT = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: getPriceTier(userP),
          quantity: 1,
        },
      ],
      customer_email: userP.email, // Pre-fill email field
      metadata: {
        customer_name: `${userP.first_name} ${userP.last_name}`, // Pass the name as metadata
      },
      mode: 'payment' ,
      
      success_url: VITE_STRIPE_SUCCESS_URL,
      cancel_url: VITE_STRIPE_CANCEL_URL,
    });
  } else {
    sessionT = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: getPriceTier(userP),
          quantity: 1,
        },
      ],
      customer_email: userP.email, // Pre-fill email field
      metadata: {
        customer_name: `${userP.first_name} ${userP.last_name}`, // Pass the name as metadata
      },
      mode: 'subscription' ,
      
      subscription_data:{
        trial_settings:{
          end_behavior:{
            missing_payment_method:"cancel"
          }
        },
        trial_period_days:30
      },
      payment_method_collection:"if_required",
      success_url: VITE_STRIPE_SUCCESS_URL,
      cancel_url: VITE_STRIPE_CANCEL_URL,
    });
  }
    //console.log(`Leaving session T`)
//    //console.log(sessionT)

    return sessionT;
  }
  

  const handleSubmit = async () => {
    //console.log(`Inside submit`)
    setShowMsg(true)
    setErrors(null);
    //console.log(`After submit`)
    if (validateStep()) {
      //console.log(`Inside Validate Step`)
      if(currentStep == 4){
        //The state is available after the user logs in.  Now continue setting up the account.  The registration process adds a User and Client record.
        //Now we only need to add a location for this client
        let locStep = await addLocation();

        if(locStep.errors && locStep.errors.length > 0){

          setErrors(locStep.errors[0])
          return;
        }

        //Set Account to 'active'
        //client.status = 'active'
        //save client
        
        //console.log(`Got the user from ${JSON.stringify(user)} and now save location to the DB ${JSON.stringify(formData)}`)
        setTimeout(()=>{
            setShowMsg(false)
            setSuccess('location added successfully');navigate('/dashboard')},
           3000);
   
       } else if(currentStep == 2){
        let aResponse = await addUser();
    

        //console.log(`A RESPONSE Errors length is ${JSON.stringify(aResponse)}`)

        if(!aResponse.data){

            setErrors(aResponse.errors[0])
            setCurrentStep(1);
            setShowMsg(false)
            return;
        }


        //Now Login As User

        
        const lresponse = await loginUser(formData.email, formData.password);

        console.log(`This session is now for ${lresponse.userData.email}`)

        dispatch(updateUser(lresponse.userData));
        

        let savedClient = lresponse.userData?.clients[0]

        let newClient =  {...savedClient, tier: formData.tier, is_trial_account: formData.subscriptionLevel == "trial",account_type: formData.subscriptionLevel, status:'pending' }

        //console.log(`Writing new client ${JSON.stringify(newClient)} to user ${JSON.stringify(lresponse.userData)}`)

        //If not bronze, overwrite client
        await patchClient(newClient)

        let userCopy = {...lresponse.userData};

        userCopy.clients = [newClient];

        dispatch(updateUser(userCopy));

        if(lresponse.errors.length == 0){
          //Forward to Stripe for Payment

          const session = await createSession(lresponse.userData);

          //console.log(`Session came back as ${JSON.stringify(session)}`)

          patchClient({...newClient, stripe_session_id: session.id})

          window.location.href = session.url;
          
          //  setCurrentStep(4)

        } else  {
            setErrors(lresponse.errors[0])
        }
            
           // setCurrentStep(4)
            setShowMsg(false)
       
       
       }
      }  else {
        //alert('hi')
        //console.log(`Step was not valid`)
        setShowMsg(false)
      }

   //console.log(`Leaving Submit....`)
  };

  return (
    <div
  className="w-full mt-8 md:mt-0 md:max-w-[60%]  mx-auto bg-gradient-to-br from-white to-[green] shadow-md md:rounded-xl relative"
  
>
        
    <h1 className="p-4  h-[6rem] flex flex-col items-end text-4xl font-bold  md:rounded-t-xl text-[black]  justify-around "><img className="w-[65%] self-start" src="http://localhost:5173/src/assets/logo.png"/><div>{currentStep != 4 ? 'Register':`Welcome ${user.first_name}`}</div></h1>
    
    <div className='text-xl text-[red] m-2 mx-6'>{errors}</div>
    <div className='text-xl text-[black] m-2'>{success}</div>
    <div className='p-6 bg-[white]'>
      {currentStep < 3 && (<div className="flex w-full justify-between mb-4">
        Step {currentStep} of 3 
        
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
              <a href="" target="_top">I agree to receive SMS texts and email notifications  
              </a>
            </label>
          </div>
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
            <span className="ml-2">{formData.subscriptionLevel.charAt(0).toUpperCase() + formData.subscriptionLevel.slice(1)}</span>
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
                {/*Thanks for your interest in starting a monthly subscription to WaterWatch PRO. Select a service level and enter as many locations as you wish. Billing is based on the number of your locations and the service level (link back to the Prices section of the WWP website).  
Questions? Contact us at support@waterwatchpro.com. */}
<div class="w-full p-6 bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-md md:rounded-xl">
  <h2 class="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">Subscription Pricing</h2>
  
  <div class="grid gap-6 md:grid-cols-3">
  
    <div class="flex flex-col items-center justify-center border border-yellow-400 rounded-lg p-6 bg-yellow-50 shadow-md">
      <h3 class="text-xl font-bold text-yellow-700 mb-2">Gold</h3>
      <p class="text-4xl font-bold text-gray-800 mb-2">$24.00</p>
      <p class="text-gray-600 text-sm text-center">Base charge to initialize service</p>
    </div>

  
    <div class="flex flex-col items-center justify-center border border-gray-400 rounded-lg p-6 bg-gray-50 shadow-md">
      <h3 class="text-xl font-bold text-gray-700 mb-2">Silver</h3>
      <p class="text-4xl font-bold text-gray-800 mb-2">$18.00</p>
      <p class="text-gray-600 text-sm text-center">Base charge to initialize service</p>
    </div>

  
    <div class="flex flex-col items-center justify-center border border-orange-400 rounded-lg p-6 bg-orange-50 shadow-md">
      <h3 class="text-xl font-bold text-orange-700 mb-2">Bronze</h3>
      <p class="text-4xl font-bold text-gray-800 mb-2">$12.00</p>
      <p class="text-gray-600 text-sm text-center">Base charge to initialize service</p>
    </div>
  </div>

  
  <div class="mt-8 text-gray-700 text-sm md:text-base leading-6">
    <p class="mb-4">
      Once you make your initial payment, you can add as many locations as you want to pay for. During the next billing cycle, your recurring subscription cost is based on the number of locations in your account and service level.
    </p>
    <p class="font-semibold text-gray-800 text-center">
      Your card will automatically be charged on the renewal date.
    </p>
  </div>
</div>

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
{formData.tier === "gold" && (
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
                    //console.log(`Trying to Submit`)
                    handleSubmit();
                }
            }}
          >
            {currentStep < 2 ? 'Next' : 'Next'} <FaChevronRight />
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
      
      </div>
      <WorkingDialog showDialog={showMsg}/>
    </div>
  );
};

export default FormWizard;
