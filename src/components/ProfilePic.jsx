import React, { useEffect, useRef, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import Upgrade from './Upgrade';
import { Link } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';


export default function ProfilePic({className, mini, mobile=false}){

    const dispatch = useDispatch();

    const user = useSelector( state => state.userInfo.user)

    console.log(`Mini is now ${JSON.stringify(mini)}`)

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuRef = useRef(null); // Reference for the profile menu

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
        }

        // Attach event listener
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
        // Cleanup event listener on component unmount
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div>
            {!mini && <div className={`flex md:flex  text-sm items-end md:gap-2 justify-end mx-4 items-center tab ${className}`}>
            
            <div className='text-lg text-[#3F6212] capitalize'>Welcome {user.first_name} {user.last_name}  {user.is_superuser ? `(${user.role})` : `(${user.clients[0]?.tier} Level)`} </div>
            <div className=' md:flex flex-col items-center justify-center'>
                <Upgrade  showMsg={false}>
                <Link className='hidden' to="/double">Switch User</Link>
                </Upgrade>
            
            </div>
            </div>}
            {mini  && (
                <div className='relative' ref={menuRef}>
                    <div className="flex flex-row">
                        <div className="hidden  md:flex bg-[#128CA6] text-white px-4 h-10 flex items-center text-center text-nowrap text-ellipsis justify-center rounded-l-full text-sm">
                        {user.clients[0].account_name}
                        </div>
                        {mobile == false && <div 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className="flex items-center justify-center h-20 w-20 md:w-10 md:h-10 aspect-square rounded-full text-3xl md:text-sm font-semibold cursor-pointer bg-gray-600 text-white -ml-2 border-2 border-white"
                        >
                        {user.first_name?.charAt(0)}
                        {user.last_name?.charAt(0)}
                        </div>}
                        {mobile == true && <div 
                        
                        className="flex items-center justify-center h-20 w-20 md:w-10 md:h-10 aspect-square rounded-full text-3xl md:text-sm font-semibold cursor-pointer bg-gray-600 text-white -ml-2 border-2 border-white"
                        >
                        {user.first_name?.charAt(0)}
                        {user.last_name?.charAt(0)}
                        </div>}
                    </div>
                    {isMenuOpen && <ProfileMenu user={user} closeMenu={() => setIsMenuOpen(false)} />}
              </div>
              
              
                )
            }
        </div>
    );
}