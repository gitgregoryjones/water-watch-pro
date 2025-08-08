import React, { useEffect, useState } from 'react';
import { Link, NavLink, useSearchParams } from 'react-router-dom';
import api from '../utility/api';
import { VITE_EMAIL_PROXY, VITE_WATER_WATCH_SUPPORT } from '../utility/constants';
import { useSelector } from 'react-redux';
import fetchByPage from '../utility/fetchByPage';
import waterportalLogo from '../assets/waterportal.png';
import { useContext } from 'react';
import { ThemeContext } from '../utility/ThemeContext';
import { useFeatureFlags } from '@geejay/use-feature-flags';
import { FaMoon, FaSun } from 'react-icons/fa';

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

  const { theme, toggleTheme } = useContext(ThemeContext);

  const {isActive} = useFeatureFlags();

  const user = useSelector((state) => state.userInfo.user);

  const client = user?.clients?.[0];

  const [rows, setRows] = useState([]);

  const [searchParams] = useSearchParams();

  const [initalDate,setInitialDate] = useState(new Date());





  



  useEffect(()=>{

  if(!searchParams.get("anon")){
    (async ()=> {
      let locs = await fetchByPage(`/api/locations`);

      let enhanced = locs.filter((l)=> searchParams.get("location_id") && Number(l.id) === Number(searchParams.get("location_id"))).map((m)=> {m.reportTypes = []; m.lastReportDate = endOfPreviousMonth(new Date(m.created_at)); return m});

     // alert(JSON.stringify(enhanced[0]))

     //alert(JSON.stringify(user))
  
     setFormData({...formData, locations:enhanced, name:`${user.first_name} ${user.last_name}`, email:user.email, billingEmail:user.clients?.[0]?.invoice_email, phone:user.phone})

     // setFormData({...formData,locations:enhanced.slice(0,3)});

    })();
  }

 

  },[searchParams,user])
  


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
      
      <div className='max-w-2xl flex flex-col gap-4 items-center justify-center p-8 text-white bg-[#128DA6]'>
        <p>Thanks for your request. Look for a confirmation email and invoice.
We will charge your card on file for the amount and send you an Excel spreadsheet via email.</p>

<p>Our emails come from <a className='text-white underline' href="mailto:support@waterwatchpro.com">support@waterwatchpro.com</a>. Be sure to look in your junk or spam email and be sure to whitelist our email address.</p>

<p>If you have any questions, contact <a className='text-white underline' href="mailto:support@waterwatchpro.com">support@waterwatchpro.com</a>.</p> 
      </div>
    );
    /*
    Thanks for your request. Look for a confirmation email and invoice.
We will charge your card on file for the amount and send you an Excel spreadsheet via email.

Our emails come from support@waterwatchpro.com. Be sure to look in your junk or spam email and be sure to whitelist our email address.

If you have any questions, contact support@waterwatchpro.com. */
  }

function beginOfPreviousMonth(date : Date){

  return new Date(date.getFullYear(), date.getMonth() - 1, 1)

}

function endOfPreviousMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 0);
}


  return (
    <div className="w-full max-w-5xl mx-auto p-6  bg-[var(--header-bg)] border shadow-md rounded-md mt-10">
      <div className='flex flex-row items-center justify-center gap-12'>
{
  "modified_code": "<img src={waterportalLogo} alt=\"WaterWatchPro Logo\" className=\"mx-auto mb-6 smax-w-[250px]\" />\n<button onClick={toggleTheme} className=\"menu-item bm-item text-[--main-2]\">\n{theme === 'dark' ? ("
}
                <FaSun color="yellow" className="outline-none" size={20} />
              ) : (
                <FaMoon className="text-slate-800 outline-none" size={20}/>
              )}
            </button>
          )}
      </div>
      
      <div className='border rounded-lg flex  flex-col gap-2 justify-center items-center text-[24px] text-center p-8 mb-12 text-white bg-[#128DA6]'>
        <div className='flex flex-col gap-1 text-md'>Purchase past data for any Continental U.S. location as far back as November 2022. The cost is 25¢ per day or 10¢ per hour. Once data is entered, we will charge your card on file for the amount of data requested, We will send you the data in an Excel spreadsheet.

<p className='py-4'>For data requests older than November 2022, contact <a className='text-white underline' href="mailto:support@waterwatchpro.com">support@waterwatchpro.com</a></p>

{<p className='py-4 text-yellow-200'>
This location will be automatically added to your account. If you do NOT wish to retain it, please delete it after you receive your past data spreadsheet.</p>}
</div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
  <h2 className="text-xl font-semibold text-[#128DA6]">Requester Info</h2>

  <div className="w-full flex flex-col md:flex-row gap-4">
    <div className="flex flex-col w-full">
      <label htmlFor="name" className="text-sm font-medium ">
        Name <span className="text-red-500">*</span>
      </label>
      <input
        id="name"
        type="text"
        name="name"
        required
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        
        className="input placeholder:text-slate-500 border p-2 rounded-md"
      />
    </div>

    <div className="flex flex-col w-full md:w-1/2">
      <label htmlFor="email" className="text-sm font-medium ">
        Email address <span className="text-red-500">*</span>
      </label>
      <input
        id="email"
        type="email"
        name="email"
        required
        placeholder="Email address"
        value={formData.email}
        onChange={handleChange}
        className="input placeholder:text-slate-500 border p-2 rounded-md"
      />
    </div>
  </div>

  <div className="w-full flex flex-col md:flex-row gap-4">
    <div className="flex flex-col w-full md:w-1/2">
      <label htmlFor="billingEmail" className="text-sm font-medium ">
        Billing email (optional)
      </label>
      <input
        id="billingEmail"
        type="email"
        name="billingEmail"
        placeholder="Billing email (optional)"
        value={formData.billingEmail}
        onChange={handleChange}
        className="input placeholder:text-slate-500 border p-2 rounded-md"
      />
    </div>

    <div className="flex flex-col w-full">
      <label htmlFor="phone" className="text-sm font-medium ">
        Phone number
      </label>
      <input
        id="phone"
        type="text"
        name="phone"
        placeholder="Phone number"
        value={formData.phone}
        onChange={handleChange}
        className="input placeholder:text-slate-500 border p-2 rounded-md"
      />
    </div>
  </div>



     
        <h2 className="text-xl font-semibold pt-4 text-[#128DA6]">Location(s) Detail</h2>
       
        {formData.locations.map((loc, i) => (
          <div key={i} className="border p-4 rounded-md relative flex flex-col gap-4">
               <h2 className="text-xl font-semibold pt-4 text-[#128DA6]">Data Request (valid range November 1, 2022 - {loc.lastReportDate ? loc.lastReportDate.toLocaleDateString("US-EN",{month:"long", day:"numeric",year:"numeric"}) : new Date( new Date().getFullYear(), new Date().getMonth(), new Date().getDate()-1).toLocaleDateString("EN-US",{year:"numeric", month:"long", day:"2-digit"})})</h2>
        <div className='w-full flex flex-row gap-4'>
        <div className='flex flex-col'>
        <label htmlFor="email" className="text-sm font-medium ">
        From Date <span className="text-red-500">*</span>
      </label> 
      <div className='flex flex-col'> 
        <input type="date" name="fromDate" required value={loc.fromDate} onChange={(e)=>handleChange(e,i,'fromDate')}  min="2022-11-01"
          smax="2024-10-31" className="input placeholder:text-slate-500 border p-2 rounded-md" />
      </div>
        </div>
        <div className='flex flex-col'> 
        <label htmlFor="email" className="text-sm font-medium ">
        To Date <span className="text-red-500">*</span>
      </label> 
        <input type="date" name="toDate" required value={loc.toDate} onChange={(e)=> handleChange(e,i,"toDate")}  min="2022-11-01"
          max={loc.lastReportDate ? `${loc.lastReportDate.getFullYear()}-${(loc.lastReportDate.getMonth()+1).toString().padStart(2,"0")}-${loc.lastReportDate.getDate().toString().padStart(2,"0")}`: `${new Date().getFullYear()}-${(new Date().getMonth()+1).toString().padStart(2,"0")}-${(new Date().getDate()-1).toString().padStart(2,"0")}`} className="input placeholder:text-slate-500 border p-2 rounded-md" />
        </div>
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
            <div className='flex flex-col'>
            <label htmlFor="email" className="text-sm font-medium ">
        Location name: <span className="text-red-500">*</span>
      </label> 
            <input type="text" disabled={searchParams.get("location_id")} required placeholder="Location Name"  value={loc.name} onChange={(e) => handleChange(e, i, 'name')} className="input placeholder:text-slate-500 border p-2 rounded-md" />
            </div>
            <div className='flex flex-col-reverse gap-1'>
              <label className='text-[#128DA6] text-xs'>Latitude must be between 24 and 49 degrees</label>
              <input type="number" disabled={searchParams.get("location_id")} step="any" required placeholder={"Latitude"} min="24" max="49" value={loc.latitude} onChange={(e) => handleChange(e, i, 'latitude')} className="input placeholder:text-slate-500 border p-2 rounded-md" />
            </div>
            <div className='flex flex-col-reverse gap-1'>
            <label className='text-[#128DA6] text-xs'>Longitude must be between -122 and -66 degrees *</label>
            <input type="number" disabled={searchParams.get("location_id")}  step="any" required placeholder="Longitude" min="-122" max="-66" value={loc.longitude} onChange={(e) => {
    const value = -Math.abs(parseFloat(e.target.value));
    handleChange({ target: { value } }, i, 'longitude');
  }} className="input placeholder:text-slate-500 border p-2 rounded-md" />
  </div>
   
           
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
         <div className='hidden text-sm'><Link to={{pathname:"/wizard"}} state={{account_type:"trial"}}>Upgrade</Link> to a Gold trial account to get automatic monitoring for this location and much more!</div>
        <div className={`flex flex-row justify-between  gap-4 mt-12`}>
        
        <button type="submit" className={` bg-[#128DA6] shadow text-white py-2 px-4 rounded max-w-xs`}>Submit Report</button>
        <a  type="cancel" onClick={(e) => {
    e.preventDefault();
    searchParams.get("anon") ? window.location.href = "https://waterwatchpro.com/past-data" : window.history.back();
  }} className={` bg-white border cursor-pointer border-red-500 shadow text-red-500 py-2 px-4 rounded max-w-xs`}>Cancel</a>
        {!searchParams.get("location_id") && <button type="button" onClick={addLocation} className="border border-[#1DC0CB] text-[#1DC0CB] py-2 px-4 rounded max-w-xs ">+ Add New Location</button>}
        </div>
      </form>
    </div>
  );
};

export default AnonymousReportForm;
