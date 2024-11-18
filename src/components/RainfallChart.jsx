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

    Object.keys(hourlyData).forEach((key)=>{

      samples.push([key, hourlyData[key].total + 1]);

    })

    console.log(`Samples are sample ${JSON.stringify(samples)}`)

    return samples;

  }
  //Get User From Context

  let user = useSelector(state => state.userInfo.user)

  useEffect(()=>{

    //setData pull from DB when User Slice changes

   console.log(`Location changed! and range is ${range}`)

   

   if(range == "daily"){
      fetchJsonApi(user.accessToken,`/api/locations/${location.id}/hourly_data`,{},"GET").then(data => {
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
    setData([
     
      ["Date","Rainfall"],
      ["2024-11-17 09:00:00",0.3],
      ["2024-11-18 09:00:00",0.2],
      ["2024-11-19 09:00:00",0.4],
    ])
  }




  },[location,range])

 
  

  return (
    <div className={'w-full overflow-x-scroll md:h-[30rem]'}>
  
       <div className='h-[10rem] md:h-full' style={{ width: `${data.length * 50}px` }}>
        {
         <Chart chartType="ColumnChart" width="100%" height="100%" data={data} />
       
      }
      </div>
    </div>
  );
};

export default RainfallChart;
