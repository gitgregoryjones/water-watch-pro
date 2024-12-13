import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import WorkingDialog from '../components/WorkingDialog';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
    const [showDialog,setShowDialog] = useState(false   )
    const [showSim, setShowSim] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
   
  useEffect(()=>{

    console.log(`Placeholder for verifying the user's email token and then dropping them back into the wizard to complete registration`)
  },[] ) 

  //setTimeout(()=> {setShowSim(false); setShowDialog(true); setTimeout(()=> setShowDialog(false),3000)},2000)
  //async()=> {

        setTimeout(()=> {setShowSim(false); setShowDialog(false);
            setTimeout(()=> navigate("/",{state:{id:"e6b4e699-2a96-47fd-8a79-9c565371b7b0",first_name:"Registration", last_name:"User", clients:[{client_id:115}]}}) ,2000)

        },5000);

       // setTimeout(()=> setShowDialog(false),5000);

  //}

  return (
    <div><WorkingDialog showDialog={showDialog}/>

    <div className={`${showSim ? '' : "hidden"} flex h-full w-full bg-[white] min-w-[1000px] min-h-[5rem] justify-center items-center px-4 border-2 border-[gold] rounded-2xl`}>Beginning Simulation: Validating the User Email from the passed token param=> {queryParams.get('token')}</div>
    <div className={`${showSim ? 'hidden' : ""} flex h-full w-full bg-[white] min-w-[100px] min-h-[5rem] justify-center items-center px-4 border-2 border-[gold] rounded-2xl`}>Email Validated!, forwarding to wizard step 3 {queryParams.get('token')}</div>

    </div>
  )
}
