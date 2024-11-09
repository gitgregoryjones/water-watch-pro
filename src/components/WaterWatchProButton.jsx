

import React, { useEffect, useState } from 'react'


export default function WaterWatchProButton({secondary = "#99ba93", children, className ="",  id=""}) {

   console.log(`Secondary is now ${secondary}`)
  return (
    <button key={Math.random()} id={id}    className={`flex flex-1 bg-[${secondary}] font-bold py-3 text-md  w-full rounded-2xl justify-center items-center max-h-[3rem] text-[white] ${className}`}>{children}</button>
  )
}
