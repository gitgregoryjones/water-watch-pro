

import React, { Children } from 'react'

export default function ButtonContainer({children, className}) {
  return (
    <div className={`flex justify-around gap-4 w-full ${className}`}>{children}</div>
  )
}



