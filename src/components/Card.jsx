import React from 'react'

export default function Card({children, header, footer, className, onClick}) {
  return (
    <div  onClick={onClick && onClick()} className={` bg-[white] border rounded-xl md:rounded-2xl mx-4 flex flex-col min-w-[30%] md:min-h-[20%] md:p-4 ${className}`}>
       { header? <h1 className="card-header text-sm font-bold text-left w-full  p-2 text-3xl text-[--text-color]">{header}</h1> :<></>}
            <div className='flex w-full flex-row h-full justify-center items-center'>{children}</div>
        {footer && <div className="card-footer flex justify-around items-center ">{footer}</div>}
    </div>
  )
}


//export default Card;
