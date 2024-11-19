import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { useSelector, useDispatch } from 'react-redux';
import { Chart } from "react-google-charts";
import fetchJsonApi from '../utility/fetchJsonApi';




const RainfallChart = ({location, range = "daily"}) => {

  
  
  const [data,setData] = useState([])

  const [theRange, setRange] = useState(range);

  function getHourlyData(hourlyData){

    let samples = [["Date","Rainfall"]];

    

// Extract the hours and minutes


    Object.keys(hourlyData).forEach((key)=>{
      const date = new Date(key);
      const hours = date.getHours().toString().padStart(2, '0'); // Ensures two digits
      const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensures two digits

// Format as HH:MM
      const formattedTime = `${hours}:${minutes}`;

      samples.push([formattedTime, hourlyData[key].total]);

    })

    console.log(`Samples are sample ${JSON.stringify(samples)}`)

    return samples;

  }
  //Get User From Context

  let user = useSelector(state => state.userInfo.user)

  useEffect(()=>{

    //setData pull from DB when User Slice changes

   //console.log(`Location changed! and range is ${range}`)

   

   if(theRange == "daily"){
      fetchJsonApi(user.accessToken,`/api/locations/${location.id}/hourly_data?client_id=${user.clients[0].id}`,{},"GET").then(data => {
        if (!data.error) {
          console.log('Data received:', JSON.stringify(data));

          let values = getHourlyData(data.hourly_data);
          console.log(`Values are back`);
          console.log(values)
          setData(values)
          
        } else {
          console.log(`No data received or an error occurred. ${JSON.stringify(data.error)}`);
        }
      
    });
  } else {

    if(location.id) {
    fetchJsonApi(user.accessToken,`/api/locations/${location.id}/24h_data?client_id=${user.clients[0].id}`,{},"GET").then(data => {
      if (!data.error) {
        console.log('Data received:', JSON.stringify(data));

        let values = getHourlyData(data.hourly_data);
        console.log(`Values are back`);
        console.log(values)
        setData(values)
        
      } else {
        console.log(`No data received or an error occurred. ${JSON.stringify(data.error)}`);
      }
    
    
  });
  }

  }




  },[location,range])

 
  

  return (
    <div className={'w-full overflow-x-scroll md:h-[30rem]'}>
  
       <div className='h-[10rem] md:h-full' sstyle={{ width: `${data.length * 50}px` }}>
        
         {false && <Chart chartType="ColumnChart" width="100%" height="100%" data={data} />}
       
      <div className='flex w-full h-full text-center justify-center items-center'>{theRange} Not This Sprint</div>
      </div>
    </div>
  );
};

export default RainfallChart;
