import React from 'react'
import logo from '../assets/logo.png';

export default function LandscapeOrientation({children}) {
  return (
    <div>
      <div className="landscape-message flex flex-cols items-center justify-center w-full">
      <div className='flex items-center justify-center'><img src={logo} className='mb-4 w-5 md:w-10' /><div className='text-[blue] md:text-2xl ml-2'><span className='text-[green]'>WaterWatch</span><span className='font-bold'>PRO&trade;</span></div></div>
        <p>Please rotate your device to portrait mode.</p>
      </div>
      <div className="app-content">
        {children}
      </div>
    </div>
  )
}
