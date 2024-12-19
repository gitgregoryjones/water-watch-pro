import React, { useRef } from 'react';
import styled from 'styled-components';
import Button from '../components/WaterWatchProButton';
import { useState } from 'react';
import FormContainer from '../components/FormContainer';
import ButtonContainer from '../components/ButtonContainer';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useDispatch } from 'react-redux';
import { updateUser } from '../utility/UserSlice';
import { API_HOST } from '../utility/constants';
import api from '../utility/api';
import {loginUser} from '../utility/loginUser';
import validatePassword from '../utility/passwordFunc';

export default function ResetPassword() {
    const [loggingIn,setLoggingIn] = useState(false);
    const [retypePassword, setRetypePassword] = useState("");
    const [password, setPassword] = useState("");
    
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
  

    const navigate = useNavigate();
    const dispatch = useDispatch();

   

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'retypePassword') {
          setRetypePassword(value);
        } else if (name === 'password') {
          setPassword(value);
        }
      };

    const handleReset = async (event)=>{
        setErrorMsg(null)
        event.preventDefault();

        setLoggingIn(true)
        let err = validatePassword(password,retypePassword)
        if(err.length > 0 ){
            setErrorMsg(err[0])
            setLoggingIn(false);
            return false;

            
        }
        try {
            let post = await api.post('/auth/reset-password',{
                token:token,
                password
            })

            setLoggingIn(false)
            setSuccessMsg(`Password was successfully reset`)
            setTimeout(()=> window.location.href = "/", 5000)
            

        }catch(e){
            setErrorMsg(e.message);
            console.log(e)
            setLoggingIn(false);
            
        }
    
       

        
    }


  return (
    <div className='bg-[#217e3f] md:rounded-xl min-w-full md:min-w-[30%] md:max-w-[30%]'>
    <div className='bg-[white] w-full py-8 px-6 rounded-t-xl'>
        <img className="w-[24rem]" src={logo} alt="Logo" />
    </div>
    <FormContainer onSubmit={handleReset} className='min-w-full'>
        <div onClick={()=> window.location.href = "/"} className='cursor-pointer flex w-full justify-end items-center text-[white] text-underline underline'>I remember my password</div>
        {errorMsg && <div className={`text-[red] bg-[white] w-full p-4`}>{errorMsg}</div>}
        {successMsg && <div className={`text-[black] bg-slate-200 rounded-xl  w-full p-4`}>{successMsg}</div>}
       
        <div className='text-[white] font-bold'>Password</div>
        <input

name="password"
type="password"

onInput={handleChange}
value={password}
placeholder="New Password"
className="p-2 placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md placeholder:font-bold"
/>
<div className='text-[white] font-bold' >Re-type Password</div>
<input

name="retypePassword"
type="password"
onInput={handleChange}
value={retypePassword}
placeholder="Re-type your New Password"
className="placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md placeholder:font-bold"
/>

        
        <Button className="flex flex-1 bg-[#128CA6] font-bold py-3 text-md  w-full rounded-2xl justify-center items-center max-h-[3rem] text-[white]">
        {loggingIn ? (
                        <div className='flex justify-center gap-2 items-center'>
                            <i className="animate-spin text-[white] text-2xl fa-solid fa-spinner"></i>
                            <span className="animate-pulse text-[white]">Working...</span>
                        </div>
                    ) : (
                        "Reset Password"
                    )}</Button>
       
        
    </FormContainer>
</div>

  )
}