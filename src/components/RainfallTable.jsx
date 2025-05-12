import React, { useEffect, useState } from 'react';
import api from '../utility/api';
import WorkingDialog from './WorkingDialog';


const RainfallTable = ({ location, max = 2 }) => {

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = (today.getDate() ).toString().padStart(2, "0");
  const tomorrowDate = `${year}-${month}-${day}`;

  const [working, setWorking] = useState(false)

  const [data, setData] = useState(null);

  const  endpoint = `/api/locations/${location.id}/hourly_data?days=${max}&date=${tomorrowDate}`;

  useEffect(()=>{

     (async ()=>{
        setWorking(true)

        const response = await api.get(endpoint);

        setData(response.data);

        setWorking(false)

    })()

  },[location])


  const hourlyEntries =  data && Object.entries(data?.hourly_data)
  .sort((a, b) => new Date(b[0]) - new Date(a[0])) // Sort descending
  .map(([dateStr, values]) => ({
    date: new Date(dateStr).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', ''), // Format: MM-DD HH:mm
    hourlyTotal: values.total,
    total24h: values['24h_total'],
  }));


  return (
    <>
    <div className="h-[400px] overflow-y-scroll  border-gray-300 rounded shadow-md">
    <table className="min-w-full table-fixed">
        <thead className="bg-[#007D8C] sticky top-0 z-10">
          <tr>
            <th className="w-1/3 px-4 py-2 text-center text-sm font-bold text-white border-b">Date Time (MM-DD HH:mm)</th>
            <th className="w-1/3 px-4 py-2 text-center text-sm font-bold text-white border-b">Amount (inches)</th>
            <th className="w-1/3 px-4 py-2 text-center text-sm font-bold text-white border-b">Running Total (inches)</th>
          </tr>
        </thead>
        {!working &&  <tbody>
          {hourlyEntries?.map((entry, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b text-sm">{entry.date}</td>
              <td className="px-4 py-2 border-b text-sm">{entry.hourlyTotal.toFixed(2)}</td>
              <td className="px-4 py-2 border-b text-sm">{entry.total24h.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>}
      </table>
     
    </div>
    <WorkingDialog showDialog={working}/>
    </>
  );
};

export default RainfallTable;
