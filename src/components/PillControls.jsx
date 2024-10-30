import React from 'react'



/**
 * This is a child of the PillSwap component.  Add 1 instance for each pill header.  When a user clicks a pill, the cooresponding content will be displayed.
 * Click pill in position 1 in the header => PillSwapContent instance 1 will be displayed and so on
 * @returns body of the currently active tabbed content
 */
export default function PillControls({children}) {
  return (
    <div className='my-base rounded-2xl mx-auto w-[80%] border min-h-max  border-[--main-color] flex flex-row justify-between overflow-hidden'>        
    {children}
 </div>
  )
}


