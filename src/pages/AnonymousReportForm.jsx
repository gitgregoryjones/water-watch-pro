import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utility/api';
import { VITE_EMAIL_PROXY, VITE_WATER_WATCH_SUPPORT } from '../utility/constants';
import { useSelector } from 'react-redux';
import fetchByPage from '../utility/fetchByPage';

const AnonymousReportForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    billingEmail: '',
    phone: '',
    fromDate: '',
    toDate: '',
    locations: [
      { latitude: '', longitude: '', name: '', reportTypes: [] },
    ],
  });

  const [submitted, setSubmitted] = useState(false);

  const user = useSelector((state) => state.userInfo.user);

  const client = user?.clients?.[0];

  const [rows, setRows] = useState([]);

  



  useEffect(()=>{

    (async ()=> {
      let locs = await fetchByPage(`/api/locations`);

      let enhanced = locs.map((m)=> {m.reportTypes = []; return m});

     // alert(JSON.stringify(enhanced[0]))
  

      //setFormData({...formData,locations:enhanced.slice(0,3)});

    })();

 

  },[client])
  


  const emailSupport = async (subject,body)=>{

    const emailContent = {
           
        toEmail: VITE_WATER_WATCH_SUPPORT,
        
        subject: subject,
        textBody: body,
        htmlBody: body
      }
    
    
        const emailResponse = await api.post(
        VITE_EMAIL_PROXY,
        emailContent,
        {
        headers: {
            "Content-Type": "application/json"
        },
        }
        );
    
        return emailResponse;
    
    


  }

  const handleChange = (e, i = null, field = null) => {
    if (i !== null && field) {
      const updatedLocations = [...formData.locations];
      updatedLocations[i][field] = e.target.value;
      setFormData({ ...formData, locations: updatedLocations });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleCheckboxChange = (i, value) => {
    const updatedLocations = [...formData.locations];
    const current = updatedLocations[i].reportTypes;
    updatedLocations[i].reportTypes = current.includes(value)
      ? current.filter((r) => r !== value)
      : [...current, value];
    setFormData({ ...formData, locations: updatedLocations });
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [
        ...formData.locations,
        { latitude: '', longitude: '', locationName: '', reportTypes: [] },
      ],
    });
  };

  const removeLocation = (index) => {
    const updated = formData.locations.filter((_, i) => i !== index);
    setFormData({ ...formData, locations: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bodyLines = [
      `Requester: ${formData.name}<br/>`,
      `Email: ${formData.email}<br/>`,
      formData.billingEmail && `Billing Email: ${formData.billingEmail}<br/>`,
      formData.phone && `Phone: ${formData.phone}<br/>`,
     /* `Date Range: ${formData.fromDate} to ${formData.toDate}`*/,
      '',
    ];

    formData.locations.forEach((loc, i) => {
      bodyLines.push(`Location ${i + 1}:<br/>`);
     
      bodyLines.push(`- Name: ${loc.name}<br/>`);
      bodyLines.push(`- Range: ${loc.fromDate} - ${loc.toDate}<br/>`);
      bodyLines.push(`- Latitude: ${loc.latitude}<br/>`);
      bodyLines.push(`- Longitude: ${loc.longitude}<br/>`);
      bodyLines.push(`- Report Types: ${loc.reportTypes.join(', ')}<br/>`);
      bodyLines.push(`<br/>`);
    });

    const subject = `${formData.email} Historical Report Request (${formData.locations.length} locations)`;
    const body = bodyLines.filter(Boolean).join('');
    const mailto = `mailto:support@waterwatchpro.com?subject=${subject}&body=${body}`;

    //window.location.href = mailto;
    await emailSupport(subject,body)
    setSubmitted(true);
  };




  if (submitted) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-8 text-center text-2xl">
        <img src="https://waterwatchpro25.com/logo.png" className="max-w-[250px]" alt="Logo" />
        Your report will arrive in 24-48 Hours. Thanks!
      </div>
    );
  }



  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <img src="https://waterwatchpro25.com/logo.png" alt="WaterWatchPro Logo" className="mx-auto mb-6 max-w-[250px]" />
      <div className='border rounded-lg flex  flex-col gap-2 justify-center items-center text-[24px] text-center p-8 mb-12 text-white bg-[#128DA6]'>
        <div className='flex flex-row gap-1'>Ad-Hoc Historical Reports by Location<div className="text-yellow-300 hidden text-md">*</div></div>
        <div className='text-white text-sm self-end md:self-center'>* This service requires a processing fee.</div> 
        <div className='text-white text-sm self-end md:self-center'>Contact support@waterwatchpro.com to learn more</div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-[#128DA6]">Requester Info</h2>
        <div className='w-full flex flex-col md:flex-row gap-4'>
        <input type="text" name="name" required placeholder="Name" value={formData.name} onChange={handleChange} className="input placeholder:text-slate-500 placeholder:text-slate-500 border p-2 rounded-md" />
        <input type="email" name="email" required placeholder="Email address" value={formData.email} onChange={handleChange} className="input placeholder:text-slate-500 border p-2 rounded-md" />
        <input type="email" name="billingEmail" placeholder="Billing email (optional)" value={formData.billingEmail} onChange={handleChange} className="input placeholder:text-slate-500 border p-2 rounded-md" />
        <input type="text" name="phone" placeholder="Phone number" value={formData.phone} onChange={handleChange} className="input placeholder:text-slate-500 border p-2 rounded-md" />
        </div>

     
        <h2 className="text-xl font-semibold pt-4 text-[#128DA6]">Location(s) Detail</h2>
       
        {formData.locations.map((loc, i) => (
          <div key={i} className="border p-4 rounded-md relative flex flex-col gap-4">
               <h2 className="text-xl font-semibold pt-4 text-[#128DA6]">Data Request (valid range Nov 2022 - Today)</h2>
        <div className='w-full flex flex-row gap-4'>
        <input type="date" name="fromDate" required value={loc.fromDate} onChange={(e)=>handleChange(e,i,'fromDate')}  min="2022-11-01"
          max="2024-10-31" className="input placeholder:text-slate-500 border p-2 rounded-md" />
        <input type="date" name="toDate" required value={loc.toDate} onChange={(e)=> handleChange(e,i,"toDate")}  min="2022-11-01"
           className="input placeholder:text-slate-500 border p-2 rounded-md" />
        </div>
            {formData.locations.length > 1 && (
              <button
                type="button"
                className="absolute top-2 right-2 text-white bg-red-500 px-2 py-1 rounded"
                onClick={() => removeLocation(i)}
              >
                X
              </button>
            )}
            <div className='w-full grid  md:flex-row gap-4'>
            <input type="text" required placeholder="Location Name" value={loc.name} onChange={(e) => handleChange(e, i, 'name')} className="input placeholder:text-slate-500 border p-2 rounded-md" />
            <input type="number" step="any" required placeholder="Latitude"  min="24" max="49" value={loc.latitude} onChange={(e) => handleChange(e, i, 'latitude')} className="input placeholder:text-slate-500 border p-2 rounded-md" />
            <input type="number" step="any" required placeholder="Longitude" min="-122" max="-66" value={loc.longitude} onChange={(e) => handleChange(e, i, 'longitude')} className="input placeholder:text-slate-500 border p-2 rounded-md" />
           
            </div>

            <div className="pt-4 flex flex-col gap-4">
              {['daily', 'hourly'].map((type) => (
                <label key={type} className="mr-4">
                  <input
                    type="checkbox"
                    checked={loc?.reportTypes && loc.reportTypes.includes(type)}
                    onChange={() => handleCheckboxChange(i, type)}
                    className="mr-1"
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)} totals
                </label>
              ))}
            </div>
          </div>
        ))}
         <div className='text-sm'><Link to={{pathname:"/wizard"}} state={{account_type:"trial"}}>Upgrade</Link> to a Gold trial account to get automatic monitoring for this location and much more!</div>
        <div className='flex flex-row-reverse justify-between  gap-4 mt-12'>
        <button type="button" onClick={addLocation} className="border border-[#1DC0CB] text-[#1DC0CB] py-2 px-4 rounded max-w-xs ">+ Add New Row</button>
        <button type="submit" className="bg-[#128DA6] shadow text-white py-2 px-4 rounded max-w-xs">Submit Report</button>
        </div>
      </form>
    </div>
  );
};

export default AnonymousReportForm;
