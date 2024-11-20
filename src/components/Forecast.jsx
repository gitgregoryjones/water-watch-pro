import React, { useEffect, useRef, useState } from 'react'
import Datatable from './Datatable';
import moment from 'moment';
import fetchJsonApi from '../utility/fetchJsonApi';
import { useSelector } from 'react-redux';



export default function Forecast({location, className}) {

   let [forecast,setForecast] = useState([]);

    var [localForecastData, setLocalForecastData] = useState([])

    var [headers,setHeaders] = useState([moment().format("ddd"),moment().add(1, 'days').format("ddd"),moment().add(2, 'days').format("ddd")])

    moment().format("MM/DD/YYYY");

    const imageRef = useRef(null);

    const user = useSelector((state) => state.userInfo.user);

    


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
      let test = imageRef.current;
        
      test.classList.contains("ios-fullscreen") ? imageRef.current.classList.remove("ios-fullscreen") : imageRef.current.classList.add("ios-fullscreen")
      
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

        //console.log(`Local is ${JSON.stringify(location)}`)

        if(!location){
            setForecast(["https://www.wpc.ncep.noaa.gov/qpf/fill_94qwbg.gif",
                "https://www.wpc.ncep.noaa.gov/qpf/fill_98qwbg.gif",
                "https://www.wpc.ncep.noaa.gov/qpf/fill_99qwbg.gif"]);
        }  else {
          //console.log(` Location url called will be /api/locations/${location.id}/forecast`)
        //  console.log(` Location url 2`)

          try {
          if(location.id) {
            fetchJsonApi(user.accessToken,`/api/locations/${location.id}/forecast?client_id=${user.clients[0].id}`,{},"GET").then(data => {
              if (!data.error) {
                console.log('Forecast Data received:', JSON.stringify(data));
                setLocalForecastData(data.forecasts);
              } else {
                console.log(`No data received or an error occurred. ${JSON.stringify(data.error)}`);
              }
            });
        }
        }catch (e){
          console.log(`The Error is ${e}`)

        }
          
          
         
         
        }

        
            
       
    },[location]);

   

  return (
    
        !location ?

        <div className={`px-6 min-h-[10rem] mb-4 flex justify-start gap-2 overflow-scroll ${className} `}>

            {
                forecast.map((m,i)=> {
                    return (
                        <div key={i} className='min-w-[fit-content] h-full relative overflow-hidden'>
                           
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
                            <div className='bg-[black]  p-2 text-[white] font-bold flex justify-center  items-center right-[0rem] md:right-[0rem]  w-[20%] md:w-[20%] md:top-[.5rem] center text-2xl z-index-5 top-0  absolute'>{headers[i]}</div>
                        </div>
                       
                    )
                }) 

                
            }            
    
        </div>  :

<div className='flex md:flex-row flex-row h-full min-h-[10rem] w-full flex-1 gap md:p-2 border  justify-center items-center text-[--text-color]'>
         {  headers.map((d,i) => {
	       return   (
			<div key={i} className='flex flex-col flex-1 w-full '>
          <div className='text-md font-bold text-center md:text-2xl p-4 bg-[--highlight-color]'>{d}</div>
          <div className='text-md font-bold md:text-2xl text-center p-4 '>{localForecastData[i]?.value}</div>
			
	        </div>)
           })
        }
        </div>
                 

     
    
  )
}
