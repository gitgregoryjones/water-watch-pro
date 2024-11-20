import React, { useRef } from 'react'
import logo from '../assets/logo.png';
import ProfilePic from './ProfilePic';
import { useLocation, Link } from 'react-router-dom';
import Upgrade from './Upgrade';




export default function Header() {

  const menu = useRef(null);

  const location = useLocation();

  // Check if the current path is the login page
  const isLoginPage = location.pathname === "/";

 
  
  return (
    
    <div className='md:px-[10%] flex h-[4rem] overflow-x-show md:flex px-5 justify-between md:justify-around md:gap-0 gap-4 top-0 left-0 fixed  z-50 items-center  zbg-[#CAD2C5] bg-[white] text-slate-800 font-bold w-full md:min-h-24 md:text-xl border-b'>
      <div className='flex items-center gap-4'>
        <img src={logo} className='w-[14rem] md:w-[20rem]' />
        <span className="text-[#ecbf1d] text-xl md:text-2xl">Trial Ends in X Days</span>
      </div>
      <div className='hidden flex '><input type="text" placeholder='Search Locations' className='relative flex text-sm p-2 pl-8 placeholder:text-slate-400 rounded-2xl min-w-[20rem]'/>
        <i className='fas fa-search absolute pl-4 pb-4 top-10 text-slate-400 text-sm'></i>
      </div>
      <div className='hidden md:flex justify-around items-center gap-4 items-end'> 
      <Link to="/dashboard" className={`hover:text-[--main-2] ${location.pathname == "/dashboard" ? "text-slate-800"  : "text-[--main-2]"}`}>Data</Link>
    <Link to="/reports"  onClick={()=>{} } className={location.pathname == "/reports" ? "text-slate-800"  : "text-[--main-2]"}>Reports</Link>
    <Link to="/settings"  className={location.pathname == "/settings" ? "text-slate-800"  : "text-[--main-2]"}>Settings</Link>
    <Link to="/assignments"  className={location.pathname == "/assignments" ? "text-slate-800"  : "text-[--main-2]"}>Assignments</Link>
    <Link to="/"  className={location.pathname == "/" ? "text-slate-800"  : "text-[--main-2]"}>Logout</Link>
    <div className=' flex fa-stack relative flex justify-center items-center'>
      <a href="#alerts" className='text-[#ecbf1d]'><i className="fa-regular fa-bell"></i></a>
      
        <div className='flex flex-1 bg-[#ecbf1d] rounded-2xl w-2 h-2 absolute top-1 left-6' ></div>
      
      </div>
    
   {/* <Upgrade tier={3} showMsg={false}><Link  to="/switch" className={location.pathname == "/switch" ? "text-slate-800"  : "text-[--main-2]"}>Switch User</Link></Upgrade>*/}
    </div>

    
      
      
      
    </div>
  )
}
