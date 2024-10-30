import React, { useState } from 'react'


export  function closeWindow(event){

    setShow(false);

}

export function openWindow(event){

    setShow(true);
}

export function FullScreen({show}) {

    

  return (
    <div className='h-[100vh] w-[100vw] relative bg-slate-800 text-white-800 absolute'>
        <div onClick={()=> setShow(true)} className={`close absolute right-4 top-4 p-4 bg-red-800 rounded-6xl  text-2xl ${show? 'full-window-show' : 'full-window-hide'}`}>x</div>
        
        FullScreen
    </div>
  )
}

