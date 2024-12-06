import React from 'react'

export default function PrettyHeader({
        icon = <i className="fa-solid fa-droplet text-[--main-1] text-md"></i>, 
        bgColor = 'bg-[#128CA6]', 
        textSize = 'text-lg', 
        children,
        className,
        textColor = 'text-white' 
     }) 
    {

  return (
    <div className={`${textColor}  ${textSize} ${bgColor} flex items-center gap-2 p-2 px-4  border rounded  ${className}    `}>
        {icon}{children}
    </div>
  )
}

