import React, { useEffect, useState } from 'react'

import fetchJsonApi from '../utility/fetchJsonApi';
import { useSelector } from 'react-redux';


export default function Processing() {

    let user = useSelector(state => state.userInfo.user)

    let [status, setStatus] = useState("");

    let [showMsg, setShowMsg] = useState(false);

    let [displayTime,setDisplayTime] = useState();

    function convertTime(timeStr){

        const dateObj = new Date(timeStr);

        // Extract hours and minutes
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        return `${hours}${minutes}`;
    }
    
    useEffect(()=>{

        
        fetchJsonApi(user.accessToken,`/api/services/process_status`,{},"GET").then(data => {
            if (!data.error) {
              setStatus(data.status);
              setDisplayTime(convertTime(data.datetime))

             
              
            } else {
              console.log(`No data received or an error occurred. ${JSON.stringify(data.error)}`);
            }
          
        });

        
    },[])

    
  return (
    status == "processing" ? <div className='md:flex bg-[#ffbc00] p-2 rounded border border-[black]'>{status} {displayTime} data now</div>
    : <div className='md:flex bg-[#ffbc00] p-2 rounded border border-[black]'>{status[0].toUpperCase()}{status.substring(1)} through {displayTime}</div>
  )
}
