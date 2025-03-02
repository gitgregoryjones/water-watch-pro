import { useEffect, useState, } from "react";
import { useSelector } from "react-redux";
import { Link , useNavigate} from "react-router-dom";
import WorkingDialog from './WorkingDialog';
import api from '../utility/api';

import { convertTier } from '../utility/loginUser';

const ProfileMenu = ({ closeMenu, embed=true }) => {
  let user = useSelector(state => state.userInfo.user)
  const [selectedClient, setSelectedClient] = useState(user.clients[0]); // Default client
  const [showDialog,setShowDialog] = useState(false)
  const navigate = useNavigate();
  const handleClientChange = (client) => {
    setSelectedClient(client);
    location.reload(); // Reload the page to display relevant data
  };




const formatPhoneNumber = (phone) => {
  if (!phone) return "N/A"; // Return 'N/A' if phone number is missing

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"); // Format: XXX-XXX-XXXX
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4"); // Format: 1-XXX-XXX-XXXX
  }

  return phone; // Return original if formatting doesn't match common patterns
};


  async function logout(){
    setShowDialog(true)
    try {
      console.log('trying to logout')
      
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
    <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md border border-gray-300 z-50">
       <p className="px-2 pt-4 text-xs text-gray-500 uppercase">user details</p>
      {/* User Info */}
      <div className="pt-2 px-4 mb-2 text-gray-800 text-sm">
        <p className="font-semibold">{user.first_name} {user.last_name} <span className=" bg-white border-black border-2 rounded-2xl px-1 py-1 text-xs">{user.role}</span></p>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-600">{formatPhoneNumber(user.phone)}</p>
        <p className="text-gray-600 hidden capitalize"><span className=" bg-white border-black border-2 rounded-2xl px-1 py-1 text-xs">{user.role}</span></p>
       
      </div>

      {/* View Profile Link */}
      <div className="hidden border-t border-gray-200">
        
        <Link
                to={user.role == "client" ? "/client-form" : ""}
                className={`px-4 py-2 text-sm ${user.is_superuser && 'hidden'} text-blue-500 hover:bg-gray-100 `}
                onClick={()=> closeMenu()}
                state={{client:user.clients[0], myself:!user.is_superuser}}
                >
                View Profile
              </Link>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-200">
        <Link onClick={logout} className={"text-sm px-4 text-red-800"}>
      Logout 
    </Link>
      </div>

      {/* Client Selection */}
      {!user.is_superuser && <div className="border-t border-gray-200 p-2">
        <p className="px-2 text-xs text-gray-500 uppercase">Available Accounts</p>
        {user.clients.map((client, index) => (
          <div
            key={client.account_name}
            className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
            onClick={() => handleClientChange(client)}
          >
            {/* Radio Button */}
            <div className={`w-4 h-4 rounded-full border-2 ${index === 0 ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}></div>
            <span className="ml-2 text-sm">{client.account_name} </span><span className="capitalize text-sm px-2">({client.tier})</span>
          </div>
        ))}
      </div>}
      <WorkingDialog showDialog={showDialog}/>
    </div>
  );
};

export default ProfileMenu;
