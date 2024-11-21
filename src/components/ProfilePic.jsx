import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import Upgrade from './Upgrade';
import { Link } from 'react-router-dom';


export default function ProfilePic(className){

    const dispatch = useDispatch();

    const user = useSelector( state => state.userInfo.user)

    return (
            <div className={`flex md:flex  text-sm items-end md:gap-2 justify-end mx-4 items-center tab ${className}`}>
        
        
        <div className='text-lg text-[#3F6212]'>Welcome {user.clients[0].account_name}  ({user.clients[0].tier[0].toUpperCase()}{user.clients[0].tier.substring(1)} level)</div>
        <div className=' md:flex flex-col items-center justify-center'>
        <Upgrade  showMsg={false}>
        <Link className='hidden' to="/double">Switch User</Link>
        </Upgrade>
        
        </div>
    </div>
    );
}