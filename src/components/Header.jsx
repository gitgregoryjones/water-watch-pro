import React, { useRef, useState } from 'react'
import logo from '../assets/logo.png';

import { useLocation, Link } from 'react-router-dom';
import Upgrade from './Upgrade';
import { useSelector } from 'react-redux';
import api from '../utility/api';
import { useNavigate } from 'react-router-dom';






export default function Header() {

  const menu = useRef(null);

  const location = useLocation();

  const navigate = useNavigate();

  // Check if the current path is the login page
  const isLoginPage = location.pathname === "/";

  const user = useSelector((state) => state.userInfo.user);
  

  const trialEndDateStr = user.trial_end_date;
  const trialEndDate = new Date(trialEndDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const differenceInMs = trialEndDate - today;
  

  

  const daysLeft = (Math.max(Math.floor(differenceInMs / (1000 * 60 * 60 * 24)), 0));

  async function logout(){

    try {
      
      // Step 1: Log in to get the access token
      const loginResponse = await api.post(`/auth/jwt/logout`)

      navigate("/");

    }catch(e){

    }


  }

  
  return (
    
    <div className=' flex h-[4rem] overflow-x-show md:flex px-5 justify-between md:justify-around md:gap-0 gap-4 top-0 left-0 fixed  z-50 items-center   zbg-[#CAD2C5] bg-[white] text-slate-800 font-bold w-full md:min-h-24 md:text-xl border-b'>
      <div className='flex  md:flex-row flex-col xlg:flex-row items-center md:gap-4 justify-center items-center'>
        <img src={logo} className='w-[14rem] md:w-[20rem]' />
       { user.is_trial_user && <span className="text-[#ecbf1d] text-xl md:text-2xl decoration-solid"><a className="text-[#ecbf1d] decoration-solid" href="http://www.stormwatermonitor.net/swim_app/db_acm.php?ac=ZRUZGU&action=view_account">Trial Ends in {daysLeft} Days</a></span>}
      </div>
      <div className='hidden flex '><input type="text" placeholder='Search Locations' className='relative flex text-sm p-2 pl-8 placeholder:text-slate-400 rounded-2xl min-w-[20rem]'/>
        <i className='fas fa-search absolute pl-4 pb-4 top-10 text-slate-400 text-sm'></i>
      </div>
      <div className='hidden md:flex justify-around items-center gap-4 items-end'> 
      <Link to="/dashboard" className={`hover:text-[--main-2] ${location.pathname === "/dashboard" ? "text-slate-800" : "text-[--main-2]"}`}>
    Data
  </Link>
  {user.tier != 4 && (
    <div className='flex gap-4'>
  <Link to="/dashboard#graphs" className={`hover:text-[--main-2] ${location.hash === "#graphs" && location.pathname === "/dashboard" ? "text-slate-800" : "text-[--main-2]"}`}>
    Graphs
  </Link>
  <Link to="/dashboard#forecast" className={`hover:text-[--main-2] ${location.hash === "#forecast" && location.pathname === "/dashboard" ? "text-slate-800" : "text-[--main-2]"}`}>
    Forecasts
  </Link>
  </div>
)}
  <Upgrade showMsg={false} tier={0}>
    <Link to="/reports" className={location.pathname === "/reports" ? "text-slate-800" : "text-[--main-2]"}>
      Reports
    </Link>
  </Upgrade>
  {user.role != "admin" && (<Link to="/assignments" className={location.pathname === "/assignments" ? "text-slate-800" : "text-[--main-2]"}>
    Assignments
  </Link>)}
  <div>

    {user.tier == 4 ? (<Link to="/settings-admin" className={["/location-list", "/contact-list", "/settings-general"].includes(location.pathname) ? "text-slate-800" : "text-[--main-2]"}>
    Settings
  </Link>): (<Link to="/location-list" className={["/location-list", "/contact-list", "/settings-general"].includes(location.pathname) ? "text-slate-800" : "text-[--main-2]"}>
    Settings
  </Link>)}
  </div>
  
  <Link onClick={logout} className={location.pathname === "/" ? "text-slate-800" : "text-[--main-2]"}>
    Logout
  </Link>
    <div className=' hidden flex fa-stack relative flex justify-center items-center'>
      <a href="#alerts" className='text-[#ecbf1d]'><i className="fa-regular fa-bell"></i></a>
      
        <div className='flex flex-1 bg-[#ecbf1d] rounded-2xl w-2 h-2 absolute top-1 left-6' ></div>
      
      </div>
    
   {/* <Upgrade tier={3} showMsg={false}><Link  to="/switch" className={location.pathname == "/switch" ? "text-slate-800"  : "text-[--main-2]"}>Switch User</Link></Upgrade>*/}
    </div>

    
      
      
      
    </div>
  )
}
