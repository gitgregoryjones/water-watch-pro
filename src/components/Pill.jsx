
import React, { useState } from 'react'



function pillSwap(event){

    var chosenIndex = 0;
    

    event.target.parentElement.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));

    event.target.classList.add('active');

    Array.from(event.target.parentElement.querySelectorAll('.pill')).find((me,index) => {if(me == event.target){chosenIndex = index}})

    console.log(`Chosen index is ${chosenIndex}`)

    //showTab
    var pillContents = event.target.parentElement.parentElement.querySelectorAll('.pill-content');

    console.log(pillContents)

    pillContents.forEach(pc => pc.classList.add('pill-hide'));

    /* Choose The Tab with the content **/

    pillContents[chosenIndex]?.classList.remove('pill-hide');

    console.log(pillContents)
    

}

export default function Pill({children,active, clickFunction}) {

    var [active, setActive] = useState(active);

    

    

  return (
    <div onClick={(e)=>{ pillSwap(e); console.log(`Calling click function ${clickFunction}`) && clickFunction && clickFunction(e)}} className={`pill bg-[--main-color]  w-full text-[--text-color] py-2 transition-all duration-300 ease-in-out opacity-15 cursor-pointer flex items-center justify-center  ${active && 'active'}`}>
       {children}
    </div>
  )
}
