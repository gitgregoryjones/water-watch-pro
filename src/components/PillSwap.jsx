import React, { Children } from 'react'





export default function PillSwap({children}) {
    
  return (
    
    <div className='my-base rounded-2xl mx-auto max-w-[80%] border  border-[--main-color] flex flex-1 justify-between overflow-hidden'>        
       {children}
    </div>
  )
}
