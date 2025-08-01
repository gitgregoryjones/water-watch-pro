import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Upgrade from './Upgrade';
import { useSelector } from 'react-redux';
import { convertTier } from '../utility/loginUser';
import { ThemeContext } from '../utility/ThemeContext.jsx';
import { getLinkClasses } from '../utility/getLinkClasses';

const SettingsMenu = ({ activeTab }) => {
  const user = useSelector((state) => state.userInfo.user);
  const { theme } = useContext(ThemeContext);
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
        className={`${getLinkClasses(theme, activeTab === 'contacts')} font-bold border-b-2 ${
          activeTab === 'contacts' ? 'border-blue-500' : 'border-transparent'
        }`}
      >
        Modify Contacts
      </Link>)}
      {convertTier(user) !=4 && window.innerWidth > 600 && (
       <Link
        to="/location-list"
        className={`${getLinkClasses(theme, activeTab === 'locations')} font-bold border-b-2 ${
          activeTab === 'locations' ? 'border-blue-500' : 'border-transparent'
        }`}
      >
        Modify Locations
      </Link>
      )}
      {!user.is_superuser && <Link
        to="/settings-general"
        className={`${getLinkClasses(theme, activeTab === 'notifications')} font-bold border-b-2 ${
          activeTab === 'notifications' ? 'border-blue-500' : 'border-transparent'
        }`}
        >
        Notifications
      </Link>}
      <Link
        to="/client-form"
        className={`${user.is_superuser && 'hidden'} ${getLinkClasses(theme, activeTab === (!user.is_superuser ? 'mysubscription' : 'clients'))} font-bold border-b-2 ${
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
