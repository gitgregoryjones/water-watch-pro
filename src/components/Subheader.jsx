import React from 'react';
import { NavLink } from 'react-router-dom';

const SubHeader = () => {
  const linkStyle = "py-4 text-center hover:bg-lime-800/100 ";
  const activeStyle = "bg-blue-500 text-white font-bold ";

  return (
    <div className="hidden flex justify-center items-center  rounded-2xl w-1/2 md:min-w-full overflow-hidden shadow-md mb-4 bg-[#99ba93] ">
      <NavLink
        to="/location-list"
        className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : 'text-[white]'}` + ` w-full`}
      >
        Locations
      </NavLink>
      <NavLink
        to="/contact-list"
        className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : 'text-[white]'}` + ` w-full`}
      >
        Contacts
      </NavLink>
      <NavLink
        to="/settings-general"
        className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : 'text-[white]'}` + ` w-full`}
      >
        General Settings
      </NavLink>
    </div>
  );
};

export default SubHeader;
