import React, { useEffect, useState } from 'react'



export default function LocalForecast() {

    var [forecast,setForecast] = useState([]);

   


    useEffect(()=>{

           // console.log(`Starting Local Forecast`)
      
            
            setForecast([{day:"MON", rain:.25},{day:"TUE", rain:.50},{day:"WED", rain:2.50}])

       

   

    },[]);

   

  return (
    
        <div className='h-[90%] flex justify-start gap-2 overflow-scroll w-full'>

            {
                forecast.map((m,i)=> {
                    
                    return (<div key={i} className="bg-[--card-background]  border border-[--dark] flex flex-col h-full   justify-start items-center text-xl w-full">

                        <div className="bg-[--dark] w-full">{m.day}</div>
                        <div className='h-full w-full  flex flex-cols justify-center items-center text-2xl md:bg-gradient-to-b from-[--second-accent-color] to-[--main-color]'>
                            {m.rain}
                        </div>
             
                    </div>)
                }) 
                
            }            
    
         </div> 
    
  )
}
