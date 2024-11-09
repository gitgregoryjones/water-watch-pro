import React from 'react'

export default function FormContainer({children, className, onSubmit}) {
  return (
    <form onSubmit={onSubmit} className={`px-8  pb-8 form flex flex-col rounded-2xl gap-4 p-4 justify-start items-start ${className}`}>{children}</form>
  )
}