
import Container from "./components/Container";

import LoginForm from "./pages/LoginForm";

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import './index.css';
import DashboardPage from "./pages/DashboardPage";

import Header from "./components/Header";
import DoubleDash from "./components/DoubleDash";

import DashboardContent from "./components/DashboardContent";
import SwitchUser from "./pages/SwitchUser";
import {slide as Menu} from 'react-burger-menu';
import Upgrade from "./components/Upgrade";
import { useEffect, useState } from "react";
import LandscapeOrientation from "./components/LandscapeOrientation";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import MyProfile from "./pages/MyProfile";
import ProfilePic from "./components/ProfilePic";
import AssignLocations from "./pages/AssignLocations";
import LocationForm from "./components/LocationForm";
import LocationListPage from "./pages/LocationListPage";
import LocationPage from "./pages/LocationPage";
import ContactListPage from "./pages/ContactListPage";
import ContactPage from "./pages/ContactPage";
import GeneralSettingsPage from "./pages/GeneralSettings";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToHash from "./components/ScrollToHash";
import UserAccountProvisioning from "./pages/UserAccountProvisioning";
import ClientListPage from "./pages/ClientListPage";
import ClientForm from "./components/ClientForm";
import ClientPage from "./pages/ClientPage";
import FormWizard from "./pages/FormWizard";
import RegistrationComplete from "./pages/RegistrationComplete";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Prices from "./pages/Prices";
import AdminCards from "./components/AdminCards";
import { useSelector } from "react-redux";
import FormWizardDelayed from "./pages/FormWizardDelayed";
import CancelSignUp from "./pages/CancelSignUp";




function App() {

  const location = useLocation();

  

  // Check if the current path is the login page
  const isLoginPage = (location.pathname === "/"  || location.pathname === "/wizard" || location.pathname === "/registration-complete" 
    || location.pathname == "/reset-password" || location.pathname == "/forgot-password" || location.pathname == "/upgrade") ;

  

  let [open, setOpen] = useState();

  let showSettings = (e)=>{
   //e.preventDefault();
   
   setOpen(false)
   
  }

  useEffect(() => {
    // Check if the hostname is 'water-watch-pro.netlify.app'
    if (window.location.hostname == "water-watch-pro.netlify.app") {
      // Redirect to the desired domain, preserving path and query
      const newURL = `https://www.waterwatchpro25.com${location.pathname}${location.search}`;
      window.location.href = newURL;
    }
  }, [location]);

  let isMenuOpen = (state)=>{

    setOpen(state.isOpen);
  }
  
  const user = useSelector((state) => state.userInfo.user);

  return (
    <LandscapeOrientation>
      <ScrollToTop/>
    <div className={"md:hidden"}>
      
    {!isLoginPage && <Menu   onStateChange={ isMenuOpen } width={'100vw'} isOpen={open}>
    <Link to={user.role != "admin" ? `/dashboard` : "/admin"} onClick={showSettings} className="menu-item bm-item">Data</Link>
    {user.role != "admin" &&<Link to="/dashboard#graphs" onClick={()=>setOpen(false)} className={`hover:text-[--main-2] ${location.hash === "#graphs" && location.pathname === "/dashboard" ? "text-slate-800" : "text-[--main-2]"}`}>
    Graphs
  </Link>}
  {user.role != "admin" && <Link to="/dashboard#forecast"  onClick={()=>setOpen(false)} className={`hover:text-[--main-2] ${location.hash === "#forecast" && location.pathname === "/dashboard" ? "text-slate-800" : "text-[--main-2]"}`}>
    Forecasts
  </Link>}
    <div   className="flex flex-col">
      <div><Link to="/reports" onClick={showSettings} className="menu-item bm-item">Reports</Link></div>
   <Upgrade showMsg={false} tier={1}>
    {user.role != "contact" && <div><Link to={window.innerWidth > 600 ? `/location-list` : '/settings-general'} onClick={showSettings} className="menu-item bm-item">Settings</Link></div>}
    {window.innerWidth > 600 && <Link to="/assignments" onClick={showSettings} className="menu-item bm-item">Assignments</Link>}
    </Upgrade>
    </div>
   
    {/*<Link to="/profile" onClick={showSettings} className="menu-item bm-item">My Profile</Link>*/}
       
      {/* <Upgrade tier={3} showMsg={false}><Link  to="/switch" onClick={showSettings} className="menu-item bm-item">Switch Users</Link></Upgrade>*/}
          
        <a href="/" onClick={showSettings} className="menu-item bm-item">Logout</a>
      </Menu>}

            
    </div>
       
     
       {!isLoginPage && <Header />}
       <Container className="big-container bg-[#CAD2C5] md:bg-[whitesmoke] h-full">
       <ScrollToHash />
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<LocationListPage/>} />
        <Route path="/reports" element={<ReportsPage/>} />
        <Route path="/assignments" element={<AssignmentsPage/>} />
        <Route path="/assign-locations" element={<AssignLocations/>} />
        <Route path="/profile" element={<MyProfile/>} />
        <Route path="/switch" element={<SwitchUser/>} />
        <Route path="/location-form" element={<LocationPage/>} />
        <Route path="/location-list" element={<LocationListPage/>} />
        <Route path="/contact-list" element={<ContactListPage />} />
        <Route path="/settings-general" element={<GeneralSettingsPage />} />
       
        <Route path="/settings-admin" element={<ClientListPage />} />
        <Route path="/wizard" element={<FormWizardDelayed />} />
        <Route path="/registration-complete" element={<RegistrationComplete />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/upgrade" element={<Prices />} />
        <Route path="/admin" element={<AdminCards />} />
        <Route path="/cancel-signup" element={<CancelSignUp />} />

       
<Route path="/contact-form" element={<ContactPage />} />
<Route path="/client-form" element={<ClientPage />} />

      </Routes>
      
        
  
         
      </Container>

    </LandscapeOrientation>
  )
}

export default App
