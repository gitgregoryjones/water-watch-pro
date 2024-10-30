
import Container from "./components/Container";
import FormContainer from "./components/FormContainer";
import LoginForm from "./pages/LoginForm";
import Dashboard from "./components/Dashboard";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';
import DashboardPage from "./pages/DashboardPage";
import Test from "./components/Test";
import Card from "./components/Card";
import Forecast from "./components/Forecast";
import Header from "./components/Header";



function App() {
  

  return (
    <>

      <Container>
        <Header/>
       <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/test" element={<Dashboard/>} />
      </Routes>
    </BrowserRouter>
         
      </Container>
    </>
  )
}

export default App
