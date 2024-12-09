import React from 'react'
import Card from './Card'

import { useNavigate } from 'react-router-dom'



export default function Stats({header, children, onClick}) {

  const navigate = useNavigate();

  return (
    <Card onClick={()=> onClick ? onClick() : ()=> navigate("/reports")} className='cursor-pointer w-full justify-center items-center h-[10rem] items-center shadow bg-gradient-to-r from-[#128CA6] to-[#197285] text-[white]'  header={header ? header : <div className='flex gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='fa fa-solid fa-info-circle'></i>Data</div>} >
     {children ? children : (<div className='w-full flex flex-col md:flex-row justify-center gap-4 items-center justify-center'>
    <div className='flex flex-col'><div>Pass 1</div><div>Processed</div></div>
    <div className='flex flex-col'><div>Pass 2</div><div>Processing...</div></div>
    </div>)}
    </Card>
  )
}
