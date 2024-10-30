import React, { useEffect, useState } from 'react'
import Datatable from './Datatable';
import moment from 'moment';



export default function Forecast({local, className}) {

   let [forecast,setForecast] = useState([]);

    var [localForecastData, setLocalForecastData] = useState([])

    var [headers,setHeaders] = useState([moment().format("ddd"),moment().add(1, 'days').format("ddd"),moment().add(2, 'days').format("ddd")])

    moment().format("MM/DD/YYYY");

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

        <div className={`h-[90%] px-6 flex justify-start gap-2 overflow-scroll ${className}`}>

            {
                forecast.map((m,i)=> {
                    return <img key={i} onClick={()=>setShow(true)} className="my-2" src={m}/>
                }) 

                
            }            
    
        </div>  :

<div className='flex md:flex-row flex-col h-full w-full flex-1 gap-2 md:p-2 border  justify-center items-center text-[--text-color]'>
         {  headers.map(d => {
	       return   (
			<div className='flex flex-col flex-1 w-full '><div className='text-2xl p-4 bg-[--highlight-color]'>{d}</div>
			<div className='text-xl p-4 font-bold'>{Math.random().toFixed(2)}</div>
	        </div>)
           })
        }
        </div>
                 

     
    
  )
}
