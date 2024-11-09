import React from 'react'

import styled from 'styled-components';

import Button from '../components/WaterWatchProButton';

import { useState } from 'react';

import FormContainer from '../components/FormContainer';

import  ButtonContainer from '../components/ButtonContainer';

import { Link, useNavigate } from 'react-router-dom';

export default function LoginForm(){

    const [logView, setLogView] = useState(true);

    var [email, setEmail] = useState(true);

    var [password, setPassword] = useState(true);

    const navigate = useNavigate();

    const handleLogin = (event)=>{

        

        event.preventDefault();
        var inputs = document.querySelectorAll('form input');
       
        var fields = [];

        inputs.forEach((input)=> fields[input.name] = input.value )



        console.log(`Logging In ${JSON.stringify({
            email: email,
            password: password

        })}`)

        navigate("/dashboard");

        
    }

    return(

        <div className='bg-[#217e3f] md:rounded-xl min-w-full md:min-w-[30%]'>
            <div className='bg-[white] w-full py-8 px-6 rounded-t-xl'><img className="logo" src="https://img1.wsimg.com/isteam/ip/88056157-8118-4fa6-a40b-afa381a48cd5/Eye%20Words.png/:/rs=w:400,cg:true"/>
            </div>
            <FormContainer onSubmit={handleLogin} className='min-w-full'>
            
           
            <ButtonContainer>
                <Button className="hidden" onClick={(e)=>{setLogView(true)}}>Login</Button>
                <Button  className='bg-[#96B8C8]' onClick={(e)=>{setLogView(false)}}>Register</Button>
            </ButtonContainer>
            <label hidden={logView}>Name</label>
            <input hidden={logView} name="name"  placeholder="Full Name"/>
            <label className='hidden'>Email</label>
            <input name="email" type="email"onInput={(e)=> setEmail(e.target.value)} placeholder="Email Address" className='placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md  placeholder:font-bold'/>
            <label hidden={logView}>Mobile Number</label>
            <input hidden={logView} name="mobile" type="phone" placeholder="Phone Number"/>
            <label className='hidden'>Password</label>
            <input name="password" type="password" onInput={(e)=> setPassword(e.target.value)} placeholder="Enter your Password" className='placeholder:text-center rounded-xl placeholder:text-[#95b8c8] placeholder:text-md placeholder:font-bold'/> 
            <label hidden={logView} >Confirm Password</label>
            <input hidden={logView} name="confirm" type="password" placeholder="Confirm your Password"/>  
            <label hidden={logView} >Registration Code</label>
            <input hidden={logView} name="code" type="text" placeholder="Registration Code" /> 
            {
                logView ? <Button >Login</Button> : <Button>Register</Button>
            } 
            
            
        </FormContainer>
        </div>
    )
}

