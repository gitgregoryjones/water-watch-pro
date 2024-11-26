import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { API_HOST, VITE_GOOGLE_API_KEY } from '../utility/constants';
import fetchContacts from '../utility/fetchContacts';

const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today's date
  const [reportType, setReportType] = useState('daily');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactEmail, setContactEmail] = useState('');
  const [displayFormat, setDisplayFormat] = useState('html'); // 'html' or 'csv'
  const [iframeSrc,setIFrameSrc] = useState(``)
  const [contacts, setContacts] = useState([])

  const user = useSelector((state) => state.userInfo.user);
  const locations = user.locations;


  useEffect(()=>{

    fetchContacts(user).then((contacts)=> {
        console.log(`Contacts Lengths is ${contacts.length}`)
        setContacts(contacts)
    })
  },[user.id])

  const handleContactsChange = (e) =>{
    const options = Array.from(e.target.options);
    const selected = options.filter((option) => option.selected).map((option) => option.value);
    setSelectedContacts(selected);
  }

  const handleReportTypeChange = (e) => {
    const selectedType = e.target.value;
    setReportType(selectedType);

    if (selectedType === 'monthly') {
      setToDate(new Date().toISOString().slice(0, 7)); // Set default to this month in YYYY-MM
      setFromDate(''); // Clear From date
    } else if (selectedType === 'weekly') {
      const currentDate = new Date(toDate);
      const pastDate = new Date(currentDate);
      pastDate.setDate(currentDate.getDate() - 7);
      setFromDate(pastDate.toISOString().slice(0, 10));
    } else {
      setToDate(new Date().toISOString().slice(0, 10)); // Default to today
      setFromDate(''); // Clear From date
    }
  };

  const handleToDateChange = (e) => {
    const selectedDate = e.target.value;
    setToDate(selectedDate);

    if (reportType === 'weekly') {
      const currentDate = new Date(selectedDate);
      const pastDate = new Date(currentDate);
      pastDate.setDate(currentDate.getDate() - 7);
      setFromDate(pastDate.toISOString().slice(0, 10));
    }
  };

  const handleLocationsChange = (e) => {
    const options = Array.from(e.target.options);
    const selected = options.filter((option) => option.selected).map((option) => option.value);
    setSelectedLocations(selected);

    if (selected.length > 1) {
      setDisplayFormat('csv'); // Force CSV if more than one location
      

    }
  };

  const convertMonthToBackednFormat = (str) => {
    const value =str // e.g., "2024-11"
    const [year, month] = value.split('-'); // Split into year and month
    const formattedValue = `${month}-${year}`; // Rearrange to "MM-YYYY"
    return formattedValue;
  };

  const handleDownloadCSV = async () => {
    const formattedMonth = toDate.slice(0, 7); // Get YYYY-MM from the date
    const csvUrl = `${API_HOST}/html/data_by_month_pass1/${toDate}/${selectedLocations}`;
  
    try {
      const response = await fetch(csvUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${toDate}-${selectedLocations}.csv`;
      document.body.appendChild(link);
      link.click();
  
      // Clean up
      //document.body.removeChild(link);
      //window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error.message);
    }
  };
  


  const handleSubmit = (e) => {
    e.preventDefault();
    setIFrameSrc("")
    console.log(`From Date: ${fromDate}, To Date: ${toDate}, Report Type: ${reportType}`);
    console.log(`Selected Locations: ${selectedLocations}`);
    console.log(`Selected Locations: ${selectedContacts}`);
    console.log(`Contact Email: ${contactEmail}`);
    console.log(`Display Format: ${displayFormat}`);
    console.log(`Report type ${reportType}`)
    


    console.log(`IFrame is ${API_HOST}/html/data_by_month_pass1/${toDate}/${selectedLocations}`)

    let query = `${API_HOST}/html/data_by_month_pass1/${toDate}/${selectedLocations}`



    if(reportType == "monthly"){

        if(selectedLocations.length == 1) {
            if(displayFormat != "csv"){
            setIFrameSrc(query)
            }else {
                handleDownloadCSV();
            }

        }

    }
   
    // Logic for form submission
  };

  return (
    <div className="mt-[8rem] p-6 w-full flex flex-col items-center">
      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-6 w-full max-w-3xl bg-[white] p-6 rounded-xl">
        {/* Row 1 */}
        <div className="col-span-1">
          <label htmlFor="reportType" className="block text-gray-700">Report Type:</label>
          <select
            id="reportType"
            value={reportType}
            onChange={handleReportTypeChange}
            className="border border-gray-300 rounded p-2 w-full"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="col-span-1">
          <label htmlFor="locList" className="block text-gray-700">Locations:</label>
          <select
            id="locList"
            multiple
            value={selectedLocations}
            onChange={handleLocationsChange}
            className="border border-gray-300 rounded p-2 w-full h-20"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2 */}
        <div className="col-span-1">
        
          <label htmlFor="fromDate" className="block text-gray-700">From:</label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            hidden={reportType !== 'daily'}
          />
          {reportType != "daily" &&  (reportType == "monthly" ? <input className="border border-gray-300 rounded p-2 w-full" type="text" value="n/a"   />
            :   <input className="border border-gray-300 rounded p-2 w-full" type="text" value="7 Days Prior To"   />)
        }
        
        </div>
        <div className="col-span-1">
          <label htmlFor="toDate" className="block text-gray-700">{reportType === 'monthly' ? 'Choose Month:' : 'To:'}</label>
          <input
            type={reportType === 'monthly' ? 'month' : 'date'}
            id="toDate"
            value={toDate}
            onChange={handleToDateChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>

        {/* Row 3 */}
        <div className="col-span-1 hidden">
          <label htmlFor="contactList" className="block text-gray-700">Contact:</label>
          <select onchange={handleContactsChange} id="contactList" className="border border-gray-300 rounded p-2 w-full">
            <option value="">-- Select Contact --</option>
            {
                contacts.map(contact => <option value={`${contact.email}`}>{contact.name}</option> )
            }
            {/* Populate contacts dynamically if needed */}
          </select>
        </div>
        
        <div className="col-span-1">
          <label htmlFor="format" className="block text-gray-700">Format:</label>
          <select
            id="format"
            value={displayFormat}
            onChange={(e) => setDisplayFormat(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            disabled={selectedLocations.length > 1}
          >
            <option value="html">Display Only</option>
            <option value="csv">CSV</option>
            <option value="email">Email</option>
          </select>
        </div>
        {displayFormat == "email" && <div className="col-span-1">
          <label htmlFor="contactEmail" className="block text-gray-700">Email:</label>
          <input
            type="email"
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>}
        {/* Row 4 */}
        <div className="col-span-4 flex justify-center">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Generate Report
          </button>
        </div>
      </form>

      {/* Iframe */}
      <iframe id="myframe"
        src={iframeSrc}
        className="w-full h-[600px] border border-gray-300 rounded mt-6"
        title="Report Data"
      />
    </div>
  );
};

export default Reports;
