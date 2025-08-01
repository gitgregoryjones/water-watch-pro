import React, { useRef, useState } from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'


import { useLocation, Link } from 'react-router-dom';
import Upgrade from './Upgrade';
import { useSelector } from 'react-redux';
import api from '../utility/api';
import { useNavigate } from 'react-router-dom';
import WorkingDialog from './WorkingDialog';
import { convertTier } from '../utility/loginUser';
import ProfilePic from './ProfilePic';
import {VITE_FEATURE_MULTIPLE_CLIENTS} from '../utility/constants';
import { useFeatureFlags } from '@geejay/use-feature-flags';

import {getLinkClasses} from '../utility/getLinkClasses';




export default function Header({ theme, onToggleTheme }) {

  const menu = useRef(null);

  const location = useLocation();

  const navigate = useNavigate();

  const [showDialog,setShowDialog] = useState(false)

  // Check if the current path is the login page
  const isLoginPage = location.pathname === "/";

  const user = useSelector((state) => state.userInfo.user);
  
  console.log(`User in header is ${JSON.stringify(user)}`)

 

  const trialEndDateStr = user.clients[0]?.trial_end_date;
  const trialEndDate = new Date(trialEndDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const differenceInMs = trialEndDate - today;
  
  const {isActive} = useFeatureFlags()

  

  const daysLeft = (Math.max(Math.floor(differenceInMs / (1000 * 60 * 60 * 24)), 0));

  async function logout(){
    setShowDialog(true)
    try {
      
      // Step 1: Log in to get the access token
      const loginResponse = await api.post(`/auth/jwt/logout`)
      setTimeout(
      ()=> navigate("/"),2000)

      

    }catch(e){
      setShowDialog(false)
      console.log(e)
    }


  }

  
  

  return (

    <div className='header flex h-[4rem] overflow-x-show md:flex px-5 justify-between md:justify-around md:gap-0 gap-4 top-0 left-0 fixed  z-50 items-center bg-[var(--header-bg)] text-slate-800 font-bold w-full md:min-h-24 md:text-xl border-b'>
      <div className='flex  md:flex-row flex-col xlg:flex-row items-center md:gap-4 justify-center items-center'>
        <img src="/logo.png" className='w-[14rem] md:w-[20rem]' />
       { user.clients[0]?.is_trial_account && <span className="text-[#ecbf1d] text-xl md:text-2xl decoration-solid"><Link className="text-[#ecbf1d]" to="/upgrade">Trial Ends in {daysLeft} Days</Link></span>}
      </div>
      <div className='hidden flex '><input type="text" placeholder='Search Locations' className='relative flex text-sm p-2 pl-8 placeholder:text-slate-400 rounded-2xl min-w-[20rem]'/>
        <i className='fas fa-search absolute pl-4 pb-4 top-10 text-slate-400 text-sm'></i>
      </div>
      <div className='hidden md:flex justify-around items-center gap-4 items-end'> 
     <Link
        to={user.role == "admin" ? `/admin` : `/dashboard`}
        className={getLinkClasses(theme,location.pathname === "/dashboard")}
      >
        Data
      </Link>
  {convertTier(user) != 4 && (
    <div className='flex gap-4'>
  <Link
        to="/dashboard#graphs"
        className={getLinkClasses(theme,location.hash === "#graphs" && location.pathname === "/dashboard")}
      >
        Graphs
      </Link>
      <Link
        to="/dashboard#forecast"
        className={getLinkClasses(theme,location.hash === "#forecast" && location.pathname === "/dashboard")}
      >
        Forecasts
      </Link>
  </div>
)}

 
    <Link
        to="/reports"
        className={getLinkClasses(theme,location.pathname === "/reports")}
      >
        Reports
      </Link>
  
  {((user.role != "admin" && user.role != "contact" )|| (user.role == "contact" && user.co_owner == true) )  && (
      <Link
        to="/assign-locations"
        className={getLinkClasses(theme,location.pathname === "/assign-locations" || location.pathname === "/assignments")}
      >
        Assignments
      </Link>
    )}
  <div>

  {convertTier(user) == 4 ? (
      <Link
        to="/settings-admin"
        className={getLinkClasses(theme,[
          "/location-list",
          "/contact-list",
          "/settings-general",
        ].includes(location.pathname))}
      >
        Settings
      </Link>
    ) :
    ((user.role != "admin" && user.role != "contact" )|| (user.role == "contact" && user.co_owner == true) ) && (
      <Upgrade tier={1} showMsg={false}>
        <Link
          to="/contact-list"
          className={getLinkClasses(theme,[
            "/location-list",
            "/contact-list",
            "/settings-general",
            "/client-form",
          ].includes(location.pathname))}
        >
          Settings
        </Link>
      </Upgrade>
    )}
  </div>
  
  {VITE_FEATURE_MULTIPLE_CLIENTS != "true"  && (
      <Link
        onClick={logout}
        className={getLinkClasses(theme,location.pathname === "/")}
      >
        Logout
      </Link>
    )}


  {VITE_FEATURE_MULTIPLE_CLIENTS == "true" && <ProfilePic  mini={true} />}
  {onToggleTheme && isActive("dark-mode") && (
    <button onClick={onToggleTheme} className='text-[--main-2]'>
      {theme === 'dark' ? <FaSun  className='outline-none ' color='yellow'/>  : <FaMoon  className='text-slate-800 outline-none'/>}
    </button>
  )}
    <div className='hidden flex fa-stack relative flex justify-center items-center'>
      <a href="#alerts" className='text-[#ecbf1d]'><i className="fa-regular fa-bell"></i></a>

        <div className='flex flex-1 bg-[#ecbf1d] rounded-2xl w-2 h-2 absolute top-1 left-6' ></div>
      
      </div>
    
   {/* <Upgrade tier={3} showMsg={false}><Link  to="/switch" className={location.pathname == "/switch" ? "text-slate-800"  : "text-[--main-2]"}>Switch User</Link></Upgrade>*/}
    </div>

    
      
      <WorkingDialog showDialog={showDialog}/>
       
    </div>
  )
}
