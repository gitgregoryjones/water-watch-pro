import React, { useEffect, useState } from 'react';
import api from '../utility/api';
import WorkingDialog from './WorkingDialog';
import { convertTier } from '../utility/loginUser';
import { useSelector } from 'react-redux';
import {VITE_FEATURE_TABLE_COLORS} from '../utility/constants'


const RainfallTable = ({ location, max = 2 , period = 'hourly'}) => {

  const user = useSelector((state) => state.userInfo.user);

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = (today.getDate() ).toString().padStart(2, "0");
  const tomorrowDate = `${year}-${month}-${day}`;

  const [measure,setMeasure] = useState( new Date().toString())
  

  const [working, setWorking] = useState(false)

  const [data, setData] = useState(null);

  let endpoint = "";

  //alert(`period is ${period}`)

  if (period === "RapidRain") {
      endpoint = `/api/locations/${location?.id}/15m_data?hours=${12}&${user.clients?.length > 1 ? `client_id=${user.clients[0].id}`:`` }`;
    } else {

      endpoint = `/api/locations/${location?.id}/hourly_data?days=${max}&date=${tomorrowDate}`;
  }

  function subtractOneHour(dateStr) {
    const date = new Date(dateStr.replace(' ', 'T') + ":00"); // Ensure correct ISO format
    date.setHours(date.getHours() - 1);
    
    // Format back to "YYYY-MM-DD HH:mm"
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
  
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }
  
  // Example usage
  const result = subtractOneHour("2025-05-28 08:00");
  console.log(result); // "2025-05-28 07:00"
  

  useEffect(()=>{

     (async ()=>{
        setWorking(true)

        const response = await api.get(endpoint);

        const lastMeasureR = await api.get(`/api/services/process_status`);

        setMeasure(lastMeasureR.data.status === "processing" ? lastMeasureR.data.datetime /* Feedback from Gene, he wants to see the current hour all the time to match the emails showing current hour,subtractOneHour(lastMeasureR.data.datetime)*/ : lastMeasureR.data.datetime)

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
      hour12: false
      
    }).replace(',', ''), // Format: MM-DD HH:mm
    rawDate: dateStr,
    hourlyTotal: values.total,
    total24h: values['24h_total'],
  })).filter((obj)=> {console.log(`Compare ${obj.rawDate} to ${measure}`); return new Date(obj.rawDate) <= new Date(measure) } );


  //alert(measure)

  return (
    <>
    <div className="h-[400px] overflow-y-scroll  border-gray-300 rounded shadow-md">
      <div className='py-4'>Viewing {period} data</div>
    <table className="min-w-full table-fixed">
        <thead className="bg-[#007D8C] sticky top-0 z-10">
          <tr>
            <th className="w-1/3 px-4 py-2 text-center text-sm font-bold text-white border-b">Date Time (MM-DD HH:mm)</th>
            <th className="w-1/3 px-4 py-2 text-center text-sm font-bold text-white border-b">Amount (inches)</th>
            <th className={`w-1/3 px-4 py-2 text-center text-sm ${period === "RapidRain" && 'hidden'} font-bold text-white border-b`}>Running Total (inches)</th>
          </tr>
        </thead>
        {!working &&  <tbody>
          {hourlyEntries?.map((entry, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b text-sm">{entry.date}</td>
              <td className={`px-4 py-2 border-b text-sm`}>{entry.hourlyTotal.toFixed(2)}</td>
              <td className={`px-4 py-2 border-b text-sm ${period === "RapidRain" && 'hidden'} ${VITE_FEATURE_TABLE_COLORS == "true" && entry.total24h.toFixed(2)  >= location.h24_threshold ? location.atlas14_threshold && entry.total24h.toFixed(2)  > location.atlas14_threshold["24h"][0] &&  convertTier(user)  != 1 ? "bg-[red] dark:bg-[red]" : "bg-[orange] dark:bg-[orange]" : "bg-[transparent]"}`}>{entry.total24h.toFixed(2)}</td>
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
