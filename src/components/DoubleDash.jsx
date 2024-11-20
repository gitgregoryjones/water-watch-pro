import React from 'react'

import './admin.css';

export default function DoubleDash() {
  return (
   
<div classname="font-sans bg-gray-100 w-full text-gray-800 flex justify-start items-start md:flex-row flex-col" >
  <div className="sidebar w-64 md:w-1/4 lg:w-64 h-screen fixed md:relative md:h-full bg-gray-900 p-5 text-white flex flex-col shadow-lg"><h2 className="text-2xl font-bold mb-6">Water Watch Pro</h2><ul className="space-y-4"><li className="p-2 rounded-lg cursor-pointer hover:bg-indigo-600">Dashboard</li><li className="p-2 rounded-lg cursor-pointer hover:bg-indigo-600">Reports</li><li className="p-2 rounded-lg cursor-pointer hover:bg-indigo-600">Alerts</li><li className="p-2 rounded-lg cursor-pointer hover:bg-indigo-600">Settings</li><li className="p-2 rounded-lg cursor-pointer hover:bg-indigo-600">Support</li></ul></div><div className="main-content ml-0 md:ml-4 p-6 mt-32 md:mt-0 w-full"><div className="flex flex-col md:flex-row items-center justify-between mb-6"><h1 className="text-3xl font-semibold text-gray-900">Welcome to Water Watch Pro</h1><button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg mt-4 md:mt-0">Upgrade Now</button></div><div className="grid grid-cols-1 gap-4"><div className="card bg-white rounded-lg shadow-md p-5"><h3 className="text-xl font-semibold text-gray-900 mb-2">Rainfall Monitoring</h3><p className="text-gray-600">Track rainfall levels across your managed locations.</p></div><div className="card bg-white rounded-lg shadow-md p-5"><h3 className="text-xl font-semibold text-gray-900 mb-2">Forecast Alerts</h3><p className="text-gray-600">Get notified about potential flooding and heavy rainfall.</p></div></div></div></div>

  )
}
