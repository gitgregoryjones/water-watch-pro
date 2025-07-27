import React from 'react'
import Dashboard from './Dashboard-old'
import DashboardPage from '../pages/DashboardPage'

export default function DashboardContent() {
  return (
    <div className='flex w-full justify-center py-0 my-0'>
        <div className='hidden flex flex-1 min-h-full bg-[var(--primary-color)] pt-8 justify-center text-slate-700'>Left Nav</div>
        <DashboardPage className=' flex flex-4'/>
    </div>
  )
}
