import React, { useRef } from 'react'
import logo from '../assets/logo.png';
import ProfilePic from './ProfilePic';
import { useLocation, Link } from 'react-router-dom';




export default function Header() {

  const menu = useRef(null);

  const location = useLocation();

  // Check if the current path is the login page
  const isLoginPage = location.pathname === "/";

 
  
  return (
    
    <div className='flex h-[4rem] overflow-x-show md:flex justify-center md:justify-around md:gap-0 gap-4 top-0 left-0 fixed  z-50 items-center  zbg-[#CAD2C5] bg-[white] text-slate-800 font-bold w-full md:min-h-24 md:text-xl border-b'>
      <div className='flex'>
        <img src={logo} className='w-[14rem] md:w-[20rem]' />
      </div>
      <div className='hidden flex '><input type="text" placeholder='Search Locations' className='relative flex text-sm p-2 pl-8 placeholder:text-slate-400 rounded-2xl min-w-[20rem]'/>
        <i className='fas fa-search absolute pl-4 pb-4 top-10 text-slate-400 text-sm'></i>
      </div>
      <div className='hidden md:flex justify-around gap-4 items-end'> 
      <Link to="/dashboard" className={`hover:text-[--main-2] ${location.pathname == "/dashboard" ? "text-[--main-2]"  : "text-[--main-1]"}`}>Data</Link>
    <Link to="/dashboard"  onClick={()=> alert(location.pathname)} className={location.pathname == "/reports" ? "text-[--main-2]" : "text-[--main-1]"}>Reports</Link>
    <Link to="/settings"  className={location.pathname == "/settings" ? "text-[--main-2]" : "text-[--main-1]"}>Settings</Link>
    <Link to="/dashboard"  className={location.pathname == "/assignments" ? "text-[--main-2]" : "text-[--main-1]"}>Assignments</Link>
    </div>

      <div className=' flex fa-stack relative flex justify-center items-center'>
      <a href="#alerts" className='text-[#ecbf1d]'><i className="fa-regular fa-bell"></i></a>
      
        <div className='flex flex-1 bg-[#ecbf1d] rounded-2xl w-2 h-2 absolute top-1 left-6' ></div>
      
      </div>
      
      
      
    </div>
  )
}
