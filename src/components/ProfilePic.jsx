import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import Upgrade from './Upgrade';
import { Link } from 'react-router-dom';


export default function ProfilePic({className, mini}){

    const dispatch = useDispatch();

    const user = useSelector( state => state.userInfo.user)

    console.log(`Mini is now ${JSON.stringify(mini)}`)

    return (
        <div>
            {!mini && <div className={`flex md:flex  text-sm items-end md:gap-2 justify-end mx-4 items-center tab ${className}`}>
            
            <div className='text-lg text-[#3F6212] capitalize'>Welcome {user.first_name}  {user.is_superuser ? `(${user.role})` : `(${user.clients[0]?.tier} Level)`} </div>
            <div className=' md:flex flex-col items-center justify-center'>
                <Upgrade  showMsg={false}>
                <Link className='hidden' to="/double">Switch User</Link>
                </Upgrade>
            
            </div>
            </div>}
            {mini  && (
                <div onClick={()=> alert('show menu')} className='flex items-center justify-center h-8 w-8 rounded-full text-xs cursor-pointer bg-slate-400'>
                    {user.first_name.substr(0,1)}{user.last_name && user.last_name.substr(0,1)}
                </div>
                )
            }
        </div>
    );
}