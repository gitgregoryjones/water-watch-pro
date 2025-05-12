import React from 'react'

export default function Toggle({checked,onChange, tier, className}) {
  return (
   
 
    <div
      onClick={(e)=> { tier === false ? alert('Please upgrade to enable this feature') : onChange(e)} }
      className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors duration-300 ${className} ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
          checked ? 'transform translate-x-6' : ''
        }`}
      ></div>
    </div>

  
  )
}
