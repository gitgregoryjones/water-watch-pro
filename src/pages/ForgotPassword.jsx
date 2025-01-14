import React, { useRef } from 'react';

import Button from '../components/WaterWatchProButton';
import { useState } from 'react';
import FormContainer from '../components/FormContainer';
import { useLocation, useSearchParams } from 'react-router-dom';




import api from '../utility/api';



export default function ForgotPassword() {
    const [loggingIn,setLoggingIn] = useState(false);
    const [retypePassword, setRetypePassword] = useState("");
    const [email, setEmail] = useState("");
    const [emailSent,setEmailSent] = useState(false);
    
    const [errorMsg, setErrorMsg] = useState("");
  
    const searchParams = useSearchParams();

    

   

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'email') {
          setEmail(value);
        } 
      };

    const handleReset = async (event)=>{
        setErrorMsg(null)
        event.preventDefault();

        setLoggingIn(true)

        setEmailSent(true)
       
        try {
            let post = await api.post('/auth/forgot-password',{
                email
            })

            setTimeout(()=> setLoggingIn(false),3000)

            

        }catch(e){
            setErrorMsg(e.message);
            console.log(e)
            setLoggingIn(false);
            
        }
    
       

        
    }


  return (
    <div className='bg-[#217e3f] md:rounded-xl min-w-full md:min-w-[30%] md:max-w-[30%] flex flex-col items-center justify-center '>
    <div className='bg-[white] w-full py-8 px-6 rounded-t-xl'>
        <img className="w-[24rem]" src="/logo.png" alt="Logo" />
    </div>
   { ( <FormContainer onSubmit={handleReset} className='min-w-full min-h-[20rem]'>
        <div onClick={()=> window.location.href = "/"} className='cursor-pointer flex w-full justify-end items-center text-[white] text-underline underline'>I remember my password</div>
        {errorMsg && <div className={`text-[red] bg-[whitesmoke] w-full p-4`}>{errorMsg}</div>}
        <div className={`flex items-center justify-center text-[black] bg-slate-200 rounded-xl  w-full p-4`}>{emailSent ? 'Check your email for additional instructions' : 'Enter your email and we will send you instructions to reset your password'}</div>
       
        <div className='text-[white] font-bold'>Email</div>
        <input

name="email"
type="email"
required
onInput={handleChange}
value={email}
placeholder="Enter Email"
className="p-2 placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md placeholder:font-bold"
/>

        
        <Button className="flex flex-1 bg-[#128CA6] font-bold py-3 text-md  w-full rounded-2xl justify-center items-center max-h-[3rem] text-[white]">
        {loggingIn ? (
                        <div className='flex justify-center gap-2 items-center'>
                            <i className="animate-spin text-[white] text-2xl fa-solid fa-spinner"></i>
                            <span className="animate-pulse text-[white]">Working...</span>
                        </div>
                    ) : (
                        "Continue"
                    )}</Button>
       
        
    </FormContainer>)}
</div>

  )
}
