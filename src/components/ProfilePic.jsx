import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import Upgrade from './Upgrade';
import { Link } from 'react-router-dom';


export default function ProfilePic(className){

    const dispatch = useDispatch();

    const user = useSelector( state => state.userInfo.user)

    return (
            <div className={`flex md:flex text-sm items-end justify-center tab ${className}`}>
        
        <div className='hidden'>{user.name} ({user.role})</div>
        <div title={`${user.name} ${user.role}`} className='cursor-pointer text-md bg-[#217e3f] text-[white] p-2 rounded-[50%]'>{user.firstName[0]} {user.lastName[0]}</div>
        <Upgrade  showMsg={false}>
        
        &nbsp; <Link to="/double">Switch User</Link>
        </Upgrade>
        
    </div>
    );
}