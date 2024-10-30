import React from 'react'

export default function Card({children, header, footer, className}) {
  return (
    <div className={`border rounded-2xl  w-full md:min-h-96 md:p-4 text-center ${className}`}>
       { header? <h1 className="card-header text-left px-5 py-2 text-3xl text-[--text-color]">{header}</h1> :<></>}
            {children}
        {footer && <div className="card-footer flex justify-around items-center ">{footer}</div>}
    </div>
  )
}


//export default Card;
