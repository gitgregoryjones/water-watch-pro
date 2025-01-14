import React from 'react'


export default function LandscapeOrientation({children}) {
  return (
    <div>
      <div className="landscape-message hidden flex flex-col items-center justify-center w-full gap-4">
      <div className='flex items-center justify-center'><img src="/logo.png" className='mb-4 w-5 md:w-[20rem]' /></div>
        <p className='pl-4'>Please rotate your device to portrait mode.</p>
      </div>
      <div className="app-content">
        {children}
      </div>
    </div>
  )
}
