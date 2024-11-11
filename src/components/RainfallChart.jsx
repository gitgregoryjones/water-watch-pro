import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { useSelector, useDispatch } from 'react-redux';


const RainfallChart = ({location = {}, range = "daily"}) => {

  
  const [data,setData] = useState([])

  let [chartData,setChartData] = useState();

  let [theLabels, setTheLabels] = useState([]);

  //Get User From Context

  let user = useSelector(state => state.userInfo.user)

  useEffect(()=>{

    //setData pull from DB when User Slice changes

    setData([
      { time: '00:00', rainfall: 0.2 * Math.random().toFixed(2)},
      { time: '00:15', rainfall: 0.5 },
      { time: '00:30', rainfall: 0.0 },
      { time: '00:45', rainfall: 1.2 },
      { time: '01:00', rainfall: 0.4 },
      { time: '01:15', rainfall: 0.8 },
      { time: '01:30', rainfall: 0.3 },
      { time: '01:45', rainfall: 1.0 },
      { time: '02:00', rainfall: 0.6 },
      { time: '02:15', rainfall: 0.9 },
      { time: '02:30', rainfall: 1.1 },
      { time: '02:45', rainfall: 0.7 },
      { time: '03:00', rainfall: 1.3 },
      { time: '03:15', rainfall: 0.4 },
      { time: '03:30', rainfall: 0.2 },
      { time: '03:45', rainfall: 1.0 },
      { time: '04:00', rainfall: 0.6 },
      { time: '04:15', rainfall: 0.9 },
      { time: '04:30', rainfall: 0.1 },
      { time: '04:45', rainfall: 0.5 },
    ])

   console.log(`Location changed! and range is ${range}`)

  },[location,range])

 
  useEffect(()=>{

    
    setTheLabels(data.map((measure, index) => measure.time));

    setChartData({
      labels: theLabels,
      datasets: [
        {
          label: `${location?.name} Rainfall (in)`,
          data: data.map(entry => entry.rainfall),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    })

  },[data])

  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 45,
        },
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  return (
    <div className={'w-full overflow-x-scroll md:h-[30rem]'}>
       <div className='h-[10rem] md:h-full' style={{ width: `${theLabels.length * 50}px` }}>
        {
        chartData?.labels.length > 0 && <Bar data={chartData} options={options} />
       
      }
      </div>
    </div>
  );
};

export default RainfallChart;
