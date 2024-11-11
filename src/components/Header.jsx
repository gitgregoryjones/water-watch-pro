import React, { useRef } from 'react'
import logo from '../assets/logo.png';
import ProfilePic from './ProfilePic';




export default function Header() {

  const menu = useRef(null);

  

  
  return (
    
    <div className='flex h-[4rem] overflow-x-show md:flex justify-around top-0 left-0 fixed  z-50 items-center  zbg-[#CAD2C5] bg-[white] text-slate-800 font-bold w-full md:min-h-24 md:text-xl border-b'>
      <div className='flex'>
        <img src={logo} className='w-[14rem] md:w-[20rem]' />
      </div>
      <div className='hidden flex '><input type="text" placeholder='Search Locations' className='relative flex text-sm p-2 pl-8 placeholder:text-slate-400 rounded-2xl min-w-[20rem]'/>
        <i className='fas fa-search absolute pl-4 pb-4 top-10 text-slate-400 text-sm'></i>
      </div>
      <ProfilePic/>
      <div className=' flex fa-stack relative flex justify-center items-center'>
      <a href="#alerts" className='text-[#ecbf1d]'><i className="fa-regular fa-bell"></i></a>
      
        <div className='flex flex-1 bg-[#ecbf1d] rounded-2xl w-2 h-2 absolute top-1 left-6' ></div>
      
      </div>
      
      
      
    </div>
  )
}
