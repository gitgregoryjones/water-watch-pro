
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
import { useState } from "react";
import LandscapeOrientation from "./components/LandscapeOrientation";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import MyProfile from "./pages/MyProfile";



function App() {

  const location = useLocation();

  // Check if the current path is the login page
  const isLoginPage = location.pathname === "/";

  

  let [open, setOpen] = useState();

  let showSettings = (e)=>{
   //e.preventDefault();
   
   setOpen(false)
   
  }

  let isMenuOpen = (state)=>{

    setOpen(state.isOpen);
  }
  

  return (
    <LandscapeOrientation>
    <div className={"md:hidden"}>
      
    {!isLoginPage && <Menu   onStateChange={ isMenuOpen } width={'100vw'} isOpen={open}>
    <Link to="/dashboard" onClick={showSettings} className="menu-item bm-item">Data</Link>
    <Link to="/reports" onClick={showSettings} className="menu-item bm-item">Reports</Link>
    <Link to="/settings" onClick={showSettings} className="menu-item bm-item">Settings</Link>
    <Link to="/assigments" onClick={showSettings} className="menu-item bm-item">Assignments</Link>
    <Link to="/profile" onClick={showSettings} className="menu-item bm-item">My Profile</Link>
       
       <Upgrade tier={3} showMsg={false}><Link  to="/switch" onClick={showSettings} className="menu-item bm-item">Switch Users</Link></Upgrade>
          
        <a href="/" onClick={showSettings} className="menu-item bm-item">Logout</a>
      </Menu>}

            
    </div>
       
     
       {!isLoginPage && <Header />}
       <Container className="big-container bg-[#CAD2C5] md:bg-[whitesmoke] h-full">
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/reports" element={<ReportsPage/>} />
        <Route path="/assignments" element={<AssignmentsPage/>} />
        <Route path="/profile" element={<MyProfile/>} />
        <Route path="/switch" element={<SwitchUser/>} />
      </Routes>
      
        
  
         
      </Container>

    </LandscapeOrientation>
  )
}

export default App
