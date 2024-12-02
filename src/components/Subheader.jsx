import React from 'react';
import { NavLink } from 'react-router-dom';

const SubHeader = () => {
  const linkStyle = "px-4 py-2 mx-2 rounded hover:bg-gray-100";
  const activeStyle = "bg-blue-500 text-white font-bold";

  return (
    <div className="flex justify-center items-center bg-[white] rounded py-4 shadow-md mb-24">
      <NavLink
        to="/location-list"
        className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : 'text-gray-700'}`}
      >
        Locations
      </NavLink>
      <NavLink
        to="/contact-list"
        className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : 'text-gray-700'}`}
      >
        Contacts
      </NavLink>
      <NavLink
        to="/settings-general"
        className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : 'text-gray-700'}`}
      >
        General Settings
      </NavLink>
    </div>
  );
};

export default SubHeader;
