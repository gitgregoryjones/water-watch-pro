import PropTypes, { func } from 'prop-types';
import React, { useReducer, useState } from 'react'





export default function LittleMenu({menuActions}) {
    console.log(`Messages`)
    console.log(menuActions[0].onClick)
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    
    var [isOpen, setIsOpen] = useState(false);

    function toggleMenu(){

        setIsOpen(!isOpen);
        
    
    }
    
  return (
    <div className='flex flex-col my-4   justify-around items-end  pr-4'>
        <div className='little-menu flex px-0 relative min-w-4 pl-2' onClick={toggleMenu}><i class="fa-solid fa-ellipsis-vertical"></i></div>
       <div className={`little-pop border bg-[white] overflow-hidden rounded-2xl absolute items-start justify-start gap-2  my-8 z-50 flex flex-col ${!isOpen ? 'hidden' : ''}`}>
        {menuActions.map((me,i) => {
            return (<div onClick={(i)=>{me.onClick(i); toggleMenu()}} className='p-2 w-full  text-sm hover:bg-[--secondary-1] hover:text-[white] transition all duration-300 ease-in-out '><div>{me.name}</div></div>)
        })}
        </div>
    </div>
  )
}

