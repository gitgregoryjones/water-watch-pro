import React from 'react'

export default function PillContent({children, className,active}) {
  return (
    <div className={`pill-content h-full ${className} ${active? 'pill-show' : 'pill-hide'}` }>{children}</div>
  )
}
