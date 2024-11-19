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

              if(data.status.toLowerCase() == "processing"){

               setShowMsg(true);
              }
              
            } else {
              console.log(`No data received or an error occurred. ${JSON.stringify(data.error)}`);
            }
          
        });

        
    },[])

    
  return (
    showMsg && <div className='md:flex bg-[#ffbc00] p-2 rounded border border-[black]'>{status} {displayTime} data now</div>
  )
}
