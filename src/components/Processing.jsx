import React, { useEffect, useState } from 'react'

import fetchJsonApi from '../utility/fetchJsonApi';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../utility/UserSlice';


export default function Processing({showPlain = false}) {

    let user = useSelector(state => state.userInfo.user)

    let [status, setStatus] = useState("");

    let [showMsg, setShowMsg] = useState(false);

    let [displayTime,setDisplayTime] = useState();

    let [plainMsg,setPlainMsg] = useState("");

    function convertTime(timeStr,minusDays = 0){

        const dateObj = new Date(timeStr);

        // Extract hours and minutes
        const hours = (dateObj.getHours() - minusDays).toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        return `${hours}${minutes}`;
    }

    
    
    useEffect(()=>{

        
        fetchJsonApi(user.accessToken,`/api/services/process_status`,{},"GET").then(data => {
            if (!data.error) {
              
             
              setStatus(data.status)
              setDisplayTime(convertTime(data.datetime))
              data.status == "processing" ? setPlainMsg(convertTime(data.datetime,1)) : setPlainMsg(convertTime(data.datetime))
             
               
              
             
              
            } else {
              console.log(`No data received or an error occurred. ${JSON.stringify(data.error)}`);
            }
          
        });

        
    },[showPlain])

  if(!showPlain) {  
  return (
  
     <div className='flex justify-center items-center text-xs md:w-[17rem] md:text-lg md:flex bg-[#ffbc00] p-2 rounded border border-[black]'>{status[0]?.toUpperCase()}{status?.substring(1)} {displayTime} ET data </div>
  )
  } else {
   return <div className='w-full  flex justify-center items-center text-xs  md:text-2xl'>Data Up To {plainMsg} ET</div>
  }
}
