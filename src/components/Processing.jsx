import React, { useEffect, useState } from 'react'

import fetchJsonApi from '../utility/fetchByPage';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../utility/UserSlice';
import api from '../utility/api';
import Stats from './Stats';


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

      const fetchProcessStatus = async () => {
       
            const {data} = await api.get(`/api/services/process_status`)
            setStatus(data.status)
            setDisplayTime(convertTime(data.datetime))
            data.status == "processing" ? setPlainMsg(convertTime(data.datetime,1)) : setPlainMsg(convertTime(data.datetime))
         
      }
      fetchProcessStatus();

        
    },[showPlain])

  if(!showPlain) {  
  return (
  
     !user.is_superuser ? <div className='flex gap-2 min-w-[8rem] flex-col md:flex-row justify-center items-center text-md md:w-[17rem] md:text-lg bg-[#ffbc00] p-2 rounded border border-[black]'><span className='text-nowrap text-xs md:text-lg'>{status[0]?.toUpperCase()}{status?.substring(1)} {displayTime} ET data</span> </div>
     :  <Stats header={<div className='flex gap-2 justify-center items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl fa fas fa-database'></i>Pass 1 </div>}>
     <div className='flex flex-col'>
     <div className='flex items-center justify-center text-3xl md:text-3xl'>Processed
     </div>
     <div className='flex gap-2 justify-center items-center'><i className='fa text-[orange] fa-solid fa-circle-exclamation'></i>As of {displayTime} EDT</div>
     </div>
   </Stats>
  )
  } else {
   return <div className=' w-full justify-start mt-4 flex md:justify-center md:items-center text-green-800 md:my-0 text-lg px-2 md:text-2xl'>Data Up To {plainMsg} ET</div>
  }
}
