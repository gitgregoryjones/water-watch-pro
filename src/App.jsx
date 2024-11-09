
import Container from "./components/Container";
import FormContainer from "./components/FormContainer";
import LoginForm from "./pages/LoginForm";
import Dashboard from "./components/Dashboard";
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import './index.css';
import DashboardPage from "./pages/DashboardPage";
import Test from "./components/Test";
import Card from "./components/Card";
import Forecast from "./components/Forecast";
import Header from "./components/Header";
import DoubleDash from "./components/DoubleDash";

import DashboardContent from "./components/DashboardContent";
import SwitchUser from "./pages/SwitchUser";
import {slide as Menu} from 'react-burger-menu';
import Upgrade from "./components/Upgrade";
import { useState } from "react";
import LandscapeOrientation from "./components/LandscapeOrientation";



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
    <>
      
    {!isLoginPage && <Menu  onStateChange={ isMenuOpen } width={'100vw'} isOpen={open}>
    <Link to="/dashboard" onClick={showSettings} className="menu-item bm-item">Dashboard</Link>
        <a id="about" className="hidden menu-item" href="/about">About</a>
       <Upgrade tier={3} showMsg={false}><Link  to="/double" onClick={showSettings} className="menu-item bm-item">Switch Users</Link></Upgrade>
        <a onClick={ showSettings } className="hidden menu-item--small" href="">Settings</a>
        <a href="/" onClick={showSettings} className="menu-item bm-item">Logout</a>
      </Menu>}

      
       
     
       {!isLoginPage && <Header />}
       <Container className="big-container bg-[#CAD2C5] md:bg-[whitesmoke] h-full">
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/test" element={<DashboardContent/>} />
        <Route path="/double" element={<SwitchUser/>} />
      </Routes>
      
        
  
         
      </Container>
      
    </>
    </LandscapeOrientation>
  )
}

export default App
