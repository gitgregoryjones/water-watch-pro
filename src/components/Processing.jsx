import React, { useEffect, useState } from 'react'

import fetchJsonApi from '../utility/fetchJsonApi';
import { useSelector } from 'react-redux';


export default function Processing({location}) {

    let user = useSelector(state => state.userInfo.user)

    let [showProcessing, setShowProcessing] = useState(true);

    let [hour,setHour] = useState(new Date().getHours());
    
    useEffect(()=>{

        fetchJsonApi(user.accessToken,`/api/locations/${location.id}/hourly_data`,{},"GET").then(data => {
            if (!data.error) {
              console.log('Data received:', JSON.stringify(data));
    
              let values = (data.hourly_data);

              let key = -1;

              console.log(`Values are back Greg`);
              console.log(values)
              if(Object.keys(values).length > 0){
                console.log(`Latest Hour is ${new Date(Object.keys(values)[0]).getHours()}`)
                key = Object.keys(values)[0];
              }

              if(new Date(Object.keys(values)[0]).getHours() == new Date().getHours() && values[key].status != "processed"){
                setShowProcessing(false);
               // console.log(`Greg Processing for key ${key} is ${values[key].status}`)
              }
              
            } else {
              console.log(`No data received or an error occurred. ${JSON.stringify(data.error)}`);
            }
          
        });

        
    },[location])

    
  return (
    showProcessing && <div className='md:flex bg-[#ffbc00] p-2 rounded border border-[black]'>Processing {`${hour}`.padStart(2, '0') }00 am data now</div>
  )
}
