import '../table.css';
import '../index.css';

import React from 'react'

export default function Datatable({headers,data}) {
  headers.map(d => {
	return (<div className='flex flex-col h-full w-full flex-1 justify-center items-center text-[--text-color]'>
			<div className='text-xl p-4 bg-[--highlight-color]'>{d}</div>
			<div className='text-lg p-4'>{Math.random().toFixed(2)}</div>
	</div>)
  })
   
			
  
}


