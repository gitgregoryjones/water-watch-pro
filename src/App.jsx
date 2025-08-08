
import Container from "./components/Container";

import LoginForm from "./pages/LoginForm";

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import './index.css';
import DashboardPage from "./pages/DashboardPage";

import Header from "./components/Header";

import { useContext } from 'react';
import { ThemeContext } from './utility/ThemeContext.jsx';
import DoubleDash from "./components/DoubleDash";

import DashboardContent from "./components/DashboardContent";
import SwitchUser from "./pages/SwitchUser";
import {slide as Menu} from 'react-burger-menu';
import Upgrade from "./components/Upgrade";
import { FaMoon, FaSun } from 'react-icons/fa';
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
import { useDispatch, useSelector } from "react-redux";
import FormWizardDelayed from "./pages/FormWizardDelayed";
import CancelSignUp from "./pages/CancelSignUp";
import ProfileMenu from "./components/ProfileMenu";
import {VITE_FEATURE_HISTORY_REPORT, VITE_FEATURE_MULTIPLE_CLIENTS} from "./utility/constants"
import api from './utility/api';
import { updateUser } from "./utility/UserSlice";
import WorkingDialog from "./components/WorkingDialog";
import UserForm from "./components/UserForm";
import ContactForm from "./components/ContactForm";
import AnonymousReportForm from "./pages/AnonymousReportForm";
import { useFeatureFlags } from "@geejay/use-feature-flags";





function App() {

  const location = useLocation();
  
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const user = useSelector((state) => state.userInfo.user);
  const dispatch = useDispatch();
  const [showDialog, setShowDialog] = useState(false);

  const featureFlagKey = import.meta.env.VITE_GEEJAY_FEATURE_FLAGS || import.meta.env.GEEJAY_FEATURE_FLAGS || "aaba70cc-6ed2-4acf-a4c7-74c9e860fc75";
  const {isActive,loading} = useFeatureFlags(featureFlagKey)

{const handleThemeToggle = () => {
  toggleTheme();
}
  };

  
  const [selectedClient, setSelectedClient] = useState(user.clients[0]);

  const handleClientChange = async (client) => {
    setShowDialog(true)
    
    //alert(client.id)
    let resp = await api.patch('/users/me',{
      primary_client_id:client.id
    })
    
    //alert(`Client id passed to backend was ${client.id} and First id returned is ${resp.data.clients[0].id}`)
    //alert(JSON.stringify(resp.data.clients[0]))
    let resp2 = await api.get('/users/me')
    console.log(`Second Pass Client id passed to backend was ${client.id} and First id returned is ${resp2.data.clients[0].id}`)
    dispatch(updateUser({...user,clients:resp2.data.clients}))
    //alert(JSON.stringify(resp.data))
    setShowDialog(false)
    window.location.reload(); // Reload the page to display relevant data
  };



  

  // Check if the current path is the login page
  const isLoginPage = (location.pathname === "/"  || location.pathname === "/order-locations" ||  location.pathname === "/wizard" || location.pathname === "/registration-complete" 
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

  if (loading) return null;

  return (
    <LandscapeOrientation>
      <ScrollToTop/>
    <div className={"md:hidden"}>
    
    {/*!isLoginPage && VITE_FEATURE_MULTIPLE_CLIENTS == "true" && <div className="absolute right-0 z-[100] p-2"><ProfilePic mobile={true} mini={true}/></div>*/}
      
    {!isLoginPage && <Menu   onStateChange={ isMenuOpen } width={'100vw'} isOpen={open}>

   {VITE_FEATURE_MULTIPLE_CLIENTS != "false" &&
   <div className="flex flex-row gap-2 ">
    <div className="px-2">
      <Link title={`Edit ${user.first_name}`}  onClick={()=>setOpen(false)}  to="/profile"><ProfilePic mobile={true} mini={true}  /></Link>
    </div>
   
      
    </div>}

{
  <button onClick={handleThemeToggle} className="menu-item bm-item text-[--main-2]">
    {theme === 'dark' ? (
          <FaSun color="yellow" className="outline-none" />
        ) : (
          <FaMoon className="text-slate-800 outline-none" />
        )}
      </button>
    )}
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
    
    {window.innerWidth > 600 && <Link to="/assignments" onClick={showSettings} className="menu-item bm-item">Assignments</Link>}
    </Upgrade>
    <a href="/" onClick={showSettings} className="menu-item bm-item">Logout</a>

    </div>
    
    {!user.is_superuser &&  VITE_FEATURE_MULTIPLE_CLIENTS == "true" && <div className="border-t border-gray-200 p-2">
        <p className="px-2 text-xs text-gray-500 uppercase font-bold"> Accounts</p>
        {user.clients.map((client, index) => (
          <div
            key={client?.account_name}
            className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
            onClick={() => handleClientChange(client)}
          >
            {/* Radio Button */}
            <div className={`w-4 h-4 rounded-full border-2 ${index === 0 ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}></div>
            <span className="ml-2 text-sm">{client?.account_name} </span><span className="capitalize text-sm px-2">({client.tier})</span>
          </div>
          
        ))}
        <div
            key={user.clients[0]?.account_name}
            className="hidden flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
            onClick={() => handleClientChange(user.clients[0])}
          >
            {/* Radio Button */}
            <div className={`w-4 h-4 rounded-full border-2  border-gray-400'}`}></div>
            <span className="ml-2 text-sm">{user.clients[0]?.account_name} </span><span className="capitalize text-sm px-2">({user.clients[0]?.tier})</span>
          </div>
      </div>}
   
    {/*<Link to="/profile" onClick={showSettings} className="menu-item bm-item">My Profile</Link>*/}
       
      {/* <Upgrade tier={3} showMsg={false}><Link  to="/switch" onClick={showSettings} className="menu-item bm-item">Switch Users</Link></Upgrade>*/}
          
       
      </Menu>}

            
    </div>
       
     
       {!isLoginPage && <Header theme={theme} onToggleTheme={handleThemeToggle} />}
       <Container className="big-container bg-[var(--primary-color)] h-full">
       <ScrollToHash />
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<LocationListPage/>} />
        <Route path="/reports" element={<ReportsPage/>} />
        <Route path="/assignments" element={<AssignmentsPage/>} />
        <Route path="/assign-locations" element={<AssignLocations/>} />
        <Route path="/profile-backup" element={<MyProfile/>} />
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
{<Route path="/cancel-signup" element={<CancelSignUp />} />
<Route path="/contact-form" element={<ContactForm />} />
<Route path="/client-form" element={<ClientPage />} />
<Route path="/profile" element={<UserForm />} />

      </Routes>
      
        
  
      <WorkingDialog showDialog={showDialog}/>
      </Container>

    </LandscapeOrientation>
  )
}

export default App
