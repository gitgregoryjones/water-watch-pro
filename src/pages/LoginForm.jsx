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
import { API_HOST } from '../utility/constants';
import api from '../utility/api';

export default function LoginForm() {
    const [logView, setLogView] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [serverError, setServerError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();

    let [loggingIn, setLoggingIn] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoggingIn(true);

        try {
            setServerError(false);

            // Step 1: Log in to get the access token
            const loginResponse = await api.post(`/auth/jwt/login`, new URLSearchParams({
                grant_type: "password",
                username: email,
                password: password,
                client_id: "string",
                client_secret: "string",
                scope: "",
            }), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const { access_token: accessToken } = loginResponse.data;

            localStorage.setItem("accessToken", accessToken);
            //localStorage.setItem("refreshToken", loginData.refresh_token);


            if (!accessToken) {
                setErrorMsg("Login failed. Please check your credentials.");
                setServerError(true);
                throw new Error("Login failed");
            }

            console.log(`Received bearer token: ${accessToken}`);

            // Step 2: Use the Token To get The Full User Profile
            const verifyResponse = await api.get(`/users/me`, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            const userData = verifyResponse.data;

            userData.firstName = userData.first_name;
            userData.lastName = userData.last_name;
            userData.accessToken = accessToken;

            switch (userData.clients[0]?.tier?.toLowerCase()) {
                case "bronze":
                    userData.tier = 1;
                    break;
                case "admin":
                case "gold":
                    userData.tier = 3;
                    break;
                case "silver":
                    userData.tier = 2;
                    break;
                default:
                    userData.tier = 0;
                    break;
            }

            // Step 3: Get the locations for this client
            const clients = userData.clients;
            if (!clients) {
                throw new Error(`Client Account information missing for this user ${userData.firstName} ${userData.lastName}`);
            }

            const locationResponse = await api.get(`/api/locations`, {
                params: {
                    client_id: clients[0].id,
                    page: 1,
                    page_size: 250,
                },
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            let myLocations = locationResponse.data.map((l) => ({
                ...l,
                location: {
                    lat: l.latitude,
                    lng: l.longitude,
                },
            }));

            // Step 4: Get 24-hour data for locations
            const ids = myLocations.map((me) => me.id);

            const location24History = await api.post(`/api/locations/24h_data`, ids, {
                params: {
                    client_id: clients[0].id,
                },
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            const loc24 = location24History.data;

            myLocations = myLocations.map((location) => {
                location.atlas14_threshold = JSON.parse(location.atlas14_threshold);
                let loc24Data = loc24.locations[location.id];
                if (loc24Data) {
                    try {
                    location.total_rainfall = loc24Data.total_rainfall;
                    location.color_24 = location.total_rainfall > location.h24_threshold
                        ? location.total_rainfall > location.atlas14_threshold['24h'][0] ? "red" : "orange"
                        : "green";

                        console.error(`Location DOES  have atlas 24 ${location.id} ${JSON.stringify(location.atlas14_threshold)}`)
                    }catch (e){
                        console.error(`Location GReg does not have atlas 24 ${location.id} ${JSON.parse(location.atlas14_threshold)["24h"][0]}`)
                    }
                }
                return location;
            });

            // Step 5: Get hourly data for locations
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

            const locationHourlyHistory = await api.post(`/api/locations/24h_data`, ids, {
                params: {
                    client_id: clients[0].id,
                    date: todayStr,
                },
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                },
            });

            const locHourly = locationHourlyHistory.data;

            myLocations = myLocations.map((location) => {
                const locHourlyData = locHourly.locations[location.id];
                if (locHourlyData) {
                    location.total_hourly_rainfall = locHourlyData.total_rainfall;
                    location.color_hourly = location.total_hourly_rainfall > location.h24_threshold
                        ? location.total_hourly_rainfall > location.atlas14_threshold['1h'][0] ? "red" : "orange"
                        : "green";
                }
                return location;
            });

            userData.locations = myLocations;

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
                {serverError && <div className={`text-[red] bg-[white] w-full p-4`}>{errorMsg}</div>}
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
                <label hidden={logView}>Email</label>
                <input
                    name="email"
                    type="email"
                    onInput={(e) => setEmail(e.target.value)}
                    value={email}
                    placeholder="Email Address"
                    className='p-2 placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md placeholder:font-bold'
                />
                <label hidden={logView}>Password</label>
                <input
                    name="password"
                    type="password"
                    onInput={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Password"
                    value={password}
                    className='placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md placeholder:font-bold'
                />
            </FormContainer>
        </div>
    );
}
