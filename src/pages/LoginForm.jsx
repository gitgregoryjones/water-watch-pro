import React from 'react';
import styled from 'styled-components';
import Button from '../components/WaterWatchProButton';
import { useState } from 'react';
import FormContainer from '../components/FormContainer';
import ButtonContainer from '../components/ButtonContainer';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useDispatch } from 'react-redux';
import { updateUser } from '../utility/UserSlice';
import { API_HOST, VITE_GOOGLE_API_KEY } from '../utility/constants';



export default function LoginForm() {
    const [logView, setLogView] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [serverError,setServerError] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            setServerError(false);
            // Step 1: Log in to get the access token
            const loginResponse = await fetch(`${API_HOST}/auth/jwt/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "password",
                    username: email,
                    password: password,
                    client_id: "string",
                    client_secret: "string",
                    scope: ""
                }),
            });

            const loginData = await loginResponse.json();

            if (!loginResponse.ok || !loginData.access_token) {
                throw new Error("Login failed");
            }

            const accessToken = loginData.access_token;

            console.log(`Read bearer token like ${accessToken}`)

            // Step 2: Use the Token To get The Full User Profile
            const verifyResponse = await fetch(`${API_HOST}/users/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                }
            });

            const userData = await verifyResponse.json();

            userData.firstName = userData.first_name;
            userData.lastName = userData.last_name;
            userData.accessToken = accessToken;
            
            switch(userData.clients[0].tier.toLowerCase()){

                case "bronze":
                    userData.tier = 1;
                break;
                case "admin":
                    userData.tier = 3;
                    break;
                case "silver":
                    userData.tier = 2
                    break;
                default:
                    userData.tier = 0;
                    break;
            }

            if (!verifyResponse.ok) {
                throw new Error("Token verification failed");
            }


            //Step 3. Get The Client/Account Information from the Returned User and Use that to get the locations for this client

            let clients = userData.clients;

            if(!clients){
                throw new Error(`Client Account information missing for this user ${userData.firstName} ${userData.lastName}`);
            }

            //TODO
            const locationResponse = await fetch(`${API_HOST}/api/locations/?client_id=${clients[0].id}&page=1&page_size=10`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                }
            });

            const myLocations = await locationResponse.json();

            userData.locations = myLocations.map((l,i)=> {
                l.location = {
                lat:l.latitude,
                lng : l.longitude
                }
                return l;
            });
            

            // Dispatch user data to Redux store
            dispatch(updateUser(userData));

            console.log("User logged in and verified:", userData);

            // Navigate to the dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);
            setServerError(true);
            alert("Failed to log in. Please check your credentials and try again.");
        }
    };

    return (
        <div className='bg-[#217e3f] md:rounded-xl min-w-full md:min-w-[30%]'>
            <div className='bg-[white] w-full py-8 px-6 rounded-t-xl'>
                <img className="w-[24rem]" src={logo} alt="Logo" />
            </div>
            <FormContainer onSubmit={handleLogin} className='min-w-full'>
                {serverError && <div className={`text-[red] bg-[white] w-full p-4`}>The Login Service is Experiencing Errors. Please contact support</div>}
                <ButtonContainer>
                    <Button className="hidden" onClick={() => setLogView(true)}>Login</Button>
                    {logView ? <Button type="submit">Login</Button> : <Button>Register</Button>}
                </ButtonContainer>
                <label hidden={logView}>Name</label>
                <input hidden={logView} name="name" placeholder="Full Name"/>
                <label className='hidden'>Email</label>
                <input name="email" type="email" onInput={(e) => setEmail(e.target.value)} placeholder="Email Address" className='placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md  placeholder:font-bold'/>
                <label hidden={logView}>Mobile Number</label>
                <input hidden={logView} name="mobile" type="phone" placeholder="Phone Number"/>
                <label className='hidden'>Password</label>
                <input name="password" type="password" onInput={(e) => setPassword(e.target.value)} placeholder="Enter your Password" className='placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md placeholder:font-bold'/>
                <label hidden={logView} >Confirm Password</label>
                <input hidden={logView} name="confirm" type="password" placeholder="Confirm your Password"/>
                <label hidden={logView} >Registration Code</label>
                <input hidden={logView} name="code" type="text" placeholder="Registration Code" />
                <Button className='bg-[#96B8C8]' onClick={() => setLogView(false)}>Register</Button>
            </FormContainer>
        </div>
    );
}
