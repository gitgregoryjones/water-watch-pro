import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Button from '../components/WaterWatchProButton';
import { useState } from 'react';
import FormContainer from '../components/FormContainer';
import ButtonContainer from '../components/ButtonContainer';
import { json, Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useDispatch } from 'react-redux';
import { updateUser } from '../utility/UserSlice';
import { API_HOST } from '../utility/constants';
import api from '../utility/api';
import {loginUser} from '../utility/loginUser';

export default function LoginForm() {
    const [logView, setLogView] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [serverError, setServerError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    let [loggingIn, setLoggingIn] = useState(false);


    //api.post(`/auth/jwt/logout`);
    

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'email') {
          setEmail(value);
        } else if (name === 'password') {
          setPassword(value);
        }
      };

    const logMeIn = async (email,password,token) =>{

        event.preventDefault();
        setLoggingIn(true);

        try {
            setServerError(false);

            let lresponse = await loginUser(email, password);

            let userData = {};

            if(lresponse.errors.length == 0){

                userData = lresponse.userData;

            }  else {
                setErrorMsg(lresponse.errors[0])
                console.log(`Encountered error ${JSON.stringify(lresponse)}`)
                return;
            }  

            if(userData.role == "admin"){
                userData.locations = [];
                dispatch(updateUser(userData));
                navigate("/admin");
                return;
            }

            const locationResponse =  await api.get(`/api/locations`, {
                params: {
                    
                    page: 1,
                    page_size: 250,
                },
                headers: {
                    "Authorization": `Bearer ${lresponse.userData.accessToken}`,
                },
            });

            if(userData.role == "contact" && locationResponse.data.length == 0){
                setErrorMsg(`Ask the account owner to assign you to a location `)
                return;

            }

            let yourLocations = locationResponse.data;

           // if(!yourLocations || yourLocations.length == 0){
           if(userData.clients[0]?.status == "pending" || yourLocations == 0){
                //await api.post('/auth/jwt/logout');
                dispatch(updateUser(userData));
                navigate("/wizard")
                return;``
            }

            console.log(`THESE ARE LOCATIONS ${JSON.stringify(yourLocations)}`)

            let myLocations = locationResponse.data.map((l) => ({
                ...l,
                location: {
                    lat: l.latitude,
                    lng: l.longitude,
                },
            }));

            // Step 4: Get 24-hour data for locations
            const ids = myLocations.map((me) => me.id);

            let todayHr = new Date();
            todayHr.setDate(todayHr.getDate() + 1);

            const todayStrHr = `${todayHr.getFullYear()}-${(todayHr.getMonth() + 1).toString().padStart(2, '0')}-${todayHr.getDate().toString().padStart(2, '0')}`;

            const location24History = await api.post(`/api/locations/24h_data`, ids, {
                params: {
                    
                    
                },
                headers: {
                    "Authorization": `Bearer ${userData.accessToken}`,
                },
            });

            const loc24 = location24History.data;

            myLocations = myLocations.map((location) => {
                //location.atlas14_threshold = JSON.parse(location.atlas14_threshold);
                location.atlas14_threshold = (location.atlas14_threshold);
                let loc24Data = loc24.locations[location.id];
                if (loc24Data) {
                    try {
                       
                    location.total_rainfall = loc24Data.total_rainfall;
                    location.color_24 = location.total_rainfall > location.h24_threshold
                        ? location.total_rainfall > location.atlas14_threshold['24h'][0] && user.tier != 1 ? "red" : "orange"
                        : "green";

                    

                        //console.error(`Location DOES  have atlas 24 ${location.id} ${JSON.stringify(location.atlas14_threshold)}`)
                    }catch (e){
                        console.error(`Location  does not have atlas 24 ${location.id} ${JSON.parse(location.atlas14_threshold)}`)
                    }
                }
                return location;
            });

            // Step 5: Get hourly data for locations
            let today = new Date();
            today.setDate(today.getDate());
            
            const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

            const locationHourlyHistory = await api.post(`/api/locations/24h_data`, ids, {
                params: {
                   
                    date: todayStr,
                },
                headers: {
                    "Authorization": `Bearer ${userData.accessToken}`,
                },
            });

            const locHourly = locationHourlyHistory.data;

            console.log(`Hourly Data is ${todayStr} ${JSON.stringify(locHourly)}`)

            myLocations = myLocations.map((location) => {
                const locHourlyData = locHourly.locations[location.id];
                if (locHourlyData) {
                    
                    location.total_hourly_rainfall = locHourlyData.total_rainfall;
                    location.color_hourly = location.total_hourly_rainfall > location.h24_threshold
                       ? "orange"
                        : "green";
                }
                return location;
            });

            //userData.locations = myLocations;

            // Dispatch user data to Redux store
            dispatch(updateUser(userData));

            console.log("User logged in and verified:", userData);

            // Navigate to the dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);
            setServerError(true);
            setErrorMsg("Failed to log in. Please try again.");
        } finally {
            setLoggingIn(false);
        }

    }

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoggingIn(true);

        try {
            setServerError(false);

            let lresponse = await loginUser(email, password);

            let userData = {};

            if(lresponse.errors.length == 0){

                userData = lresponse.userData;

            }  else {
                setErrorMsg(lresponse.errors[0])
                console.log(`Encountered error ${JSON.stringify(lresponse)}`)
                return;
            }  

            if(userData.role == "admin"){
                userData.locations = [];
                dispatch(updateUser(userData));
                navigate("/admin");
                return;
            }

            const locationResponse =  await api.get(`/api/locations`, {
                params: {
                    
                    page: 1,
                    page_size: 250,
                },
                headers: {
                    "Authorization": `Bearer ${lresponse.userData.accessToken}`,
                },
            });

            if(userData.role == "contact" && locationResponse.data.length == 0){
                setErrorMsg(`Ask the account owner to assign you to a location `)
                return;

            }

            let yourLocations = locationResponse.data;

           // if(!yourLocations || yourLocations.length == 0){
           if(userData.clients[0]?.status == "pending"){
                //await api.post('/auth/jwt/logout');
                dispatch(updateUser(userData));
                navigate("/wizard")
                return;``
            }

            let myLocations = locationResponse.data.map((l) => ({
                ...l,
                location: {
                    lat: l.latitude,
                    lng: l.longitude,
                },
            }));

            // Step 4: Get 24-hour data for locations
            const ids = myLocations.map((me) => me.id);

            let todayHr = new Date();
            todayHr.setDate(todayHr.getDate() + 1);

            const todayStrHr = `${todayHr.getFullYear()}-${(todayHr.getMonth() + 1).toString().padStart(2, '0')}-${todayHr.getDate().toString().padStart(2, '0')}`;

            const location24History = await api.post(`/api/locations/24h_data`, ids, {
                params: {
                    
                    
                },
                headers: {
                    "Authorization": `Bearer ${userData.accessToken}`,
                },
            });

            const loc24 = location24History.data;

            myLocations = myLocations.map((location) => {
                //location.atlas14_threshold = JSON.parse(location.atlas14_threshold);
                location.atlas14_threshold = (location.atlas14_threshold);
                let loc24Data = loc24.locations[location.id];
                if (loc24Data) {
                    try {
                       
                    location.total_rainfall = loc24Data.total_rainfall;
                    location.color_24 = location.total_rainfall > location.h24_threshold
                        ? location.atlas14_threshold && location.total_rainfall > location.atlas14_threshold['24h'][0] && user.tier != 1 ? "red" : "orange"
                        : "green";

                    

                        //console.error(`Location DOES  have atlas 24 ${location.id} ${JSON.stringify(location.atlas14_threshold)}`)
                    }catch (e){
                       // console.error(`Location  does not have atlas 24 ${location.id} ${JSON.parse(location.atlas14_threshold)}`)
                       console.log(e.message)
                    }
                }
                return location;
            });

            // Step 5: Get hourly data for locations
            let today = new Date();
            today.setDate(today.getDate());
            
            const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

            const locationHourlyHistory = await api.post(`/api/locations/24h_data`, ids, {
                params: {
                   
                    date: todayStr,
                },
                headers: {
                    "Authorization": `Bearer ${userData.accessToken}`,
                },
            });

            const locHourly = locationHourlyHistory.data;

            console.log(`Hourly Data is ${todayStr} ${JSON.stringify(locHourly)}`)

            myLocations = myLocations.map((location) => {
                const locHourlyData = locHourly.locations[location.id];
                if (locHourlyData) {
                    
                    location.total_hourly_rainfall = locHourlyData.total_rainfall;
                    location.color_hourly = location.total_hourly_rainfall > location.h24_threshold
                       ? "orange"
                        : "green";
                }
                return location;
            });

            //userData.locations = myLocations;

            // Dispatch user data to Redux store
            dispatch(updateUser(userData));

            console.log("User logged in and verified:", userData);

            // Navigate to the dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);
            setServerError(true);
            setErrorMsg("Failed to log in. Please try again.");
        } finally {
            setLoggingIn(false);
        }
    };

    return (
        <div className='bg-[#217e3f] md:rounded-xl min-w-full md:min-w-[30%]'>
            <div className='bg-[white] w-full py-8 px-6 rounded-t-xl'>
                <img className="w-[24rem]" src={logo} alt="Logo" />
            </div>
            
            <FormContainer onSubmit={handleLogin} className='min-w-full'>
            <div onClick={()=> window.location.href = "/forgot-password"} className='cursor-pointer flex w-full justify-end items-center text-[white] text-underline underline'>I forgot my password</div>
                {errorMsg && <div className={`text-[red] bg-[white] w-full p-4`}>{errorMsg}</div>}
                <ButtonContainer>
                    <Button className="hidden" onClick={() => setLogView(true)}>Login</Button>
                    {logView ? (
                        <Button disabled={loggingIn} className={`flex gap-2 ${loggingIn && 'bg-[white]'}`} type="submit">
                            {loggingIn ? (
                                <div className='flex justify-center gap-2 items-center'>
                                    <i className="animate-spin text-[#128CA6] text-2xl fa-solid fa-spinner"></i>
                                    <span className="animate-pulse text-[#128CA6]">Working...</span>
                                </div>
                            ) : (
                                "Login"
                            )}
                        </Button>
                    ) : (
                        <Button>Register</Button>
                    )}
                    
                </ButtonContainer>
                <div className='text-[white] font-bold'>Email</div>
                <input
        ref={emailRef}
        name="email"
        type="email"
        autoComplete="username"
        onInput={handleChange}
        value={email}
        placeholder="Email Address"
        className="p-2 placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md placeholder:font-bold"
      />
      <div className='text-[white] font-bold' >Password</div>
      <input
        ref={passwordRef}
        name="password"
        type="password"
        autoComplete="current-password"
        onInput={handleChange}
        value={password}
        placeholder="Enter your Password"
        className="placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md placeholder:font-bold"
      />

                
                <Link className="flex flex-1 bg-[#128CA6] font-bold py-3 text-md  w-full rounded-2xl justify-center items-center max-h-[3rem] text-[white]" to={{pathname:"/wizard"}} state={{account_type:"trial"}}>Create Trial Account</Link>
                <Link className="flex flex-1 bg-[#128CA6] font-bold py-3 text-md  w-full rounded-2xl justify-center items-center max-h-[3rem] text-[white]" to={{pathname:"/wizard"}}  state={{account_type:"paid"}}>Create Paid Account</Link>
                
            </FormContainer>
        </div>
    );
}
