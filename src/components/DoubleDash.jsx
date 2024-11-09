import React from 'react'

import './admin.css';

export default function DoubleDash() {
  return (
   
<div classname="font-sans bg-gray-100 w-full text-gray-800 flex justify-start items-start md:flex-row flex-col" >
  <div class="sidebar w-64 md:w-1/4 lg:w-64 h-screen fixed md:relative md:h-full bg-gray-900 p-5 text-white flex flex-col shadow-lg"><h2 class="text-2xl font-bold mb-6">Water Watch Pro</h2><ul class="space-y-4"><li class="p-2 rounded-lg cursor-pointer hover:bg-indigo-600">Dashboard</li><li class="p-2 rounded-lg cursor-pointer hover:bg-indigo-600">Reports</li><li class="p-2 rounded-lg cursor-pointer hover:bg-indigo-600">Alerts</li><li class="p-2 rounded-lg cursor-pointer hover:bg-indigo-600">Settings</li><li class="p-2 rounded-lg cursor-pointer hover:bg-indigo-600">Support</li></ul></div><div class="main-content ml-0 md:ml-4 p-6 mt-32 md:mt-0 w-full"><div class="flex flex-col md:flex-row items-center justify-between mb-6"><h1 class="text-3xl font-semibold text-gray-900">Welcome to Water Watch Pro</h1><button class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg mt-4 md:mt-0">Upgrade Now</button></div><div class="grid grid-cols-1 gap-4"><div class="card bg-white rounded-lg shadow-md p-5"><h3 class="text-xl font-semibold text-gray-900 mb-2">Rainfall Monitoring</h3><p class="text-gray-600">Track rainfall levels across your managed locations.</p></div><div class="card bg-white rounded-lg shadow-md p-5"><h3 class="text-xl font-semibold text-gray-900 mb-2">Forecast Alerts</h3><p class="text-gray-600">Get notified about potential flooding and heavy rainfall.</p></div></div></div></div>

  )
}
