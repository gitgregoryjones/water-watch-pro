import React from 'react';
import { Link } from 'react-router-dom';
import Upgrade from './Upgrade';
import { useSelector } from 'react-redux';
import { convertTier } from '../utility/loginUser';

const SettingsMenu = ({ activeTab }) => {
  const user = useSelector((state) => state.userInfo.user);
  return (
    <div className="flex justify-start rounded space-x-6 mb-8 self-start bg-[transparent] w-full p-2">
      <Upgrade showMsg={false} tier={4}>
      {window.innerWidth > 600 &&(<Link
          to="/settings-admin"
          className={`text-blue-500 hover:text-blue-700 font-bold border-b-2 ${
            activeTab === 'clients' ? 'border-blue-500' : 'border-transparent'
          }`}
        >
          Client Management
        </Link>)}
      </Upgrade>
       
      {window.innerWidth > 600 && (<Link
        to="/contact-list"
        className={`text-blue-500 hover:text-blue-700 font-bold border-b-2 ${
          activeTab === 'contacts' ? 'border-blue-500' : 'border-transparent'
        }`}
      >
        Modify Contacts
      </Link>)}
      {convertTier(user) !=4 && window.innerWidth > 600 && (
       <Link
        to="/location-list"
        className={`text-blue-500 hover:text-blue-700 font-bold border-b-2 ${
          activeTab === 'locations' ? 'border-blue-500' : 'border-transparent'
        }`}
      >
        Modify Locations
      </Link>
      )}
      <Link
        to="/settings-general"
        className={`text-blue-500 hover:text-blue-700 font-bold border-b-2 ${
          activeTab === 'notifications' ? 'border-blue-500' : 'border-transparent'
        }`}
        >
        Notifications
      </Link>
      <Link
        to="/client-form"
        className={`${user.is_superuser && 'hidden'} text-blue-500 hover:text-blue-700 font-bold border-b-2 ${
          activeTab === (!user.is_superuser ? 'mysubscription' : 'clients') ? 'border-blue-500' : 'border-transparent'
        }`}

        state={{client:user.clients[0], myself:!user.is_superuser}}
        >
        Account
      </Link>
      
    </div>
  );
};

export default SettingsMenu;
