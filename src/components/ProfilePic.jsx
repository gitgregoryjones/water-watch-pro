import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import Upgrade from './Upgrade';
import { Link } from 'react-router-dom';


export default function ProfilePic(className){

    const dispatch = useDispatch();

    const user = useSelector( state => state.userInfo.user)

    return (
            <div className={`flex md:flex  text-sm items-end md:gap-2 justify-start items-center tab ${className}`}>
        
        
        <div title={`${user.name} ${user.role}`} className='cursor-pointer text-md bg-[#217e3f] text-[white] p-2 rounded-[50%]'>{user.firstName[0]} {user.lastName[0]}</div>
        <div className='hidden md:flex flex-col items-center justify-center'>
        <Upgrade  showMsg={false}>
        <Link to="/double">Switch User</Link>
        </Upgrade>
        {user.name} ({user.role})
        </div>
    </div>
    );
}