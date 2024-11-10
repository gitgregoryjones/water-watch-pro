import React, { useEffect, useRef, useState } from 'react'
import Datatable from './Datatable';
import moment from 'moment';



export default function Forecast({local, className}) {

   let [forecast,setForecast] = useState([]);

    var [localForecastData, setLocalForecastData] = useState([])

    var [headers,setHeaders] = useState([moment().format("ddd"),moment().add(1, 'days').format("ddd"),moment().add(2, 'days').format("ddd")])

    moment().format("MM/DD/YYYY");

    const imageRef = useRef(null);

    let handleFullScreen = (event)=>{

    const element = imageRef.current;

    if (element.requestFullscreen) {
      // Standard Fullscreen API
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      // Safari
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      // IE11
      element.msRequestFullscreen();
    } else {
      // Fallback for iOS Safari - simulate full-screen using CSS
      element.classList.add("ios-fullscreen");
    }
    }

    const exitFullScreen = () => {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        // Remove fallback CSS class for iOS
        if (imageRef.current) {
          imageRef.current.classList.remove("ios-fullscreen");
        }
      };

    useEffect(()=>{

        console.log(`Local is ${local}`)

        if(!local){
            setForecast(["https://www.wpc.ncep.noaa.gov/qpf/fill_94qwbg.gif",
                "https://www.wpc.ncep.noaa.gov/qpf/fill_98qwbg.gif",
                "https://www.wpc.ncep.noaa.gov/qpf/fill_99qwbg.gif"]);
        } else {
            setForecast([{day:"MON", rain:.25},{day:"TUE", rain:.50},{day:"WED", rain:2.50}])
        }

        setLocalForecastData(["0.25","0.50","2.50"])
            
       
    },[]);

   

  return (
    
        !local ?

        <div className={`px-6 min-h-[10rem] mb-4 flex justify-start gap-2 overflow-scroll ${className} `}>

            {
                forecast.map((m,i)=> {
                    return (
                        <div className='min-w-[fit-content] h-full relative overflow-hidden'>
                           
                            <img
                            key={i}
        ref={imageRef}
        src={m}
        alt={`${headers[i]}`}
        title={headers[i]}
        onClick={handleFullScreen}
        onDoubleClick={exitFullScreen}
        className={'md:my-2'}
      />
                            <div className='bg-[green] rotate-45 p-2 text-[white] font-bold flex justify-center md:justify-start pl-20 md:pl-12 items-center right-[-3rem] md:right-[-4rem]  w-[50%] md:w-[20%] md:top-[2rem] center text-sm z-index-5 top-0  absolute'>{headers[i]}</div>
                        </div>
                       
                    )
                }) 

                
            }            
    
        </div>  :

<div className='flex md:flex-row flex-row h-full min-h-[10rem] w-full flex-1 gap md:p-2 border  justify-center items-center text-[--text-color]'>
         {  headers.map(d => {
	       return   (
			<div className='flex flex-col flex-1 w-full '><div className='text-md font-bold md:text-2xl p-4 bg-[--highlight-color]'>{d}</div>
			<div className='text-lg p-4 font-bold'>{Math.random().toFixed(2)}</div>
	        </div>)
           })
        }
        </div>
                 

     
    
  )
}
