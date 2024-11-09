import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import Upgrade from './Upgrade';
import { Link } from 'react-router-dom';


export default function ProfilePic(className){

    const dispatch = useDispatch();

    const user = useSelector( state => state.userInfo.user)

    return (
            <div className={`hidden md:flex text-sm  tab ${className}`}>
        
        {user.name} ({user.role})
        <Upgrade  showMsg={false}>
        <i className="hidden md:block pl-2 text-slate-400 text-sm  fa-solid fa-user-group"></i>
        &nbsp; <Link to="/double">Switch User</Link>
        </Upgrade>
        
    </div>
    );
}