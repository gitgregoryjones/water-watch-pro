import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { API_HOST, VITE_PRICES_LINK } from '../utility/constants';
import fetchContacts from '../utility/fetchContacts';
import Upgrade from './Upgrade';
import api from '../utility/api';
import EmailRowManager from './EmailRowManager';

const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today's date
  const [reportType, setReportType] = useState('monthly');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [displayFormat, setDisplayFormat] = useState('html'); // 'html' or 'csv'
  const [reportContent, setReportContent] = useState(''); // HTML content for the report
  const [contacts, setContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false); 

  const user = useSelector((state) => state.userInfo.user);
  const [isSelectAll,setIsSelectAll] = useState(false);
  const locations = user.locations;
  const reportAreaRef = useRef(null);

  const currentDate = new Date();
  const currentYearMonth = currentDate.toISOString().slice(0, 7); // Get current month in YYYY-MM
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    .toISOString()
    .slice(0, 7); // Get last month in YYYY-MM
  
  

    const handleSelectAllChange = () => {
        if (selectAll) {
          // Deselect all
          setSelectedLocations([]);
        } else {
          // Select all
          setSelectedLocations(locations.map((l) => l.id));
        }
        setSelectAll(!selectAll); // Toggle "Select All" state
      };

  useEffect(() => {
    // Initialize the `toDate` for monthly based on user tier
    if (reportType === 'monthly') {
      if (user.tier < 2) {
        setToDate(lastMonth); // Default to last month if tier < 2
      } else {
        setToDate(currentYearMonth); // Default to current month if tier >= 2
      }
    } else if(reportType == 'weekly' && user.tier < 2){

      setReportContent(`
        <center><div class="flex flex-col gap-4  items-center justify-center bg-[white] text-center border-[gold]  border-4 text-slate-900 p-4 rounded shadow-md  h-[20rem] md:w-[40rem]">
          This feature is not available at your current service level
          <p>
          <a href=${VITE_PRICES_LINK}>Click Here to Upgrade</a>
        </div></center>
      `)

    }else if((reportType == 'daily' || reportType == 'rapidrain') && user.tier < 2){

      setReportContent(`
        <center><div class="items-center flex-col gap-4 justify-center bg-[white] border-[gold] border-4 flex justify-center items-center text-center text-slate-900 p-4 rounded shadow-md  h-[20rem] md:w-[40rem]">
          This feature is not available at your current service level
          <p>
          <a href=${VITE_PRICES_LINK}>Click Here to Upgrade</a>
        </div></center>
      `)

    }
  }, [reportType, user.tier]);

  useEffect(() => {
    const h1Element = reportAreaRef.current?.querySelector("h1");
    if (h1Element) {
      h1Element.style.display = "none";
    }
  }, [reportType]);

  const handleReportTypeChange = (e) => {
    const selectedType = e.target.value;
    setReportType(selectedType);

    if (selectedType === 'monthly') {
      if (user.tier < 2) {
        setToDate(lastMonth); // Default to last month
      } else {
        setToDate(currentYearMonth); // Default to current month
      }
      setFromDate(''); // Clear From date
    } else if (selectedType === 'weekly') {
      
      const currentDate = new Date(toDate);
      const pastDate = new Date(currentDate);
      pastDate.setDate(currentDate.getDate() - 7);
      setFromDate(pastDate.toISOString().slice(0, 10));
      //setToDate(new Date().toISOString().slice(0, 10))
    } else {
      setFromDate(''); // Clear From date
      setToDate(new Date().toISOString().slice(0, 10)); // Default to today
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

  useEffect(() => {
    fetchContacts(user).then((contacts) => {
      console.log(`Contacts Length: ${contacts.length}`);
      setContacts(contacts);
    });
  }, [user.id]);

  

  const handleDownloadCSV = async (query) => {
    try {
      const response = await api.get(query, { responseType: 'blob' });
  
      // Create a temporary link to download the file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${toDate}-${selectedLocations.join('_')}.csv`;
      document.body.appendChild(link);
      link.click();
  
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error.message);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setReportContent(''); // Clear previous content

    const notImplemented = ["sms","emails","unpaid"]

    if(notImplemented.includes(reportType)){
      const errorMessage = `
        <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
          <p><strong>TODO:</strong> "${reportType}" Reports aren't implemented yet</p>
        </div>
      `;
      setReportContent(errorMessage);

      return;
    }
  
    // Validation logic
    if (selectedLocations.length === 0 &&  !user.is_superuser) {
      const errorMessage = `
        <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
          <p><strong>Error:</strong> Please select at least one location.</p>
        </div>
      `;
      setReportContent(errorMessage);
      window.scrollTo({top: 0, behavior: 'smooth'});
      return;
    }
  
    if (reportType === 'weekly' || reportType === 'daily' || reportType === 'rapidrain') {
      if (!fromDate || !toDate) {
        const errorMessage = `
          <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
            <p><strong>Error:</strong> Please specify both a from date and a to date for weekly or custom date ranges.</p>
          </div>
        `;
        setReportContent(errorMessage);
        window.scrollTo({top: 0, behavior: 'smooth'});
        return;
      }
    }
  
    if ((displayFormat === 'csv' || selectedLocations.length > 1) && selectedContacts.length === 0) {
      const errorMessage = `
        <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
          <p><strong>Error:</strong> Please select at least one contact when generating a CSV report or selecting multiple locations.</p>
        </div>
      `;
      setReportContent(errorMessage);
      window.scrollTo({top: 0, behavior: 'smooth'});
      return;
    }
  
    console.log(`Report Type: ${reportType}`);
    console.log(`To Date: ${toDate}`);
    console.log(`From Date: ${fromDate}`);
    console.log(`Selected Locations: ${selectedLocations}`);
    console.log(`Selected Contacts: ${selectedContacts}`);
    console.log(`Display Format: ${displayFormat}`);
  
    let query = '';
    let requestData = null;
  
    if (reportType === 'monthly') {
      const [year, month] = toDate.split('-'); // Extract year and month
      const firstDay = `${year}-${month}-01`; // First day of the month
      const lastDay = new Date(year, month, 0).toISOString().slice(0, 10); // Last day of the month
  
      console.log(`Computed From Date: ${firstDay}, To Date: ${lastDay}`);
      query = `${API_HOST}/api/reports/data_by_date_range/${firstDay}/${lastDay}`;
    } else if (reportType === 'weekly' || reportType === 'daily') {
      query = `${API_HOST}/api/reports/data_by_date_range/${fromDate}/${toDate}`;
    } else if (reportType === 'rapidrain'){
      query = `${API_HOST}/api/reports/data_by_date_range/${fromDate}/${toDate}`;
      
    }
  
    if (selectedLocations.length > 1 || displayFormat === 'csv') {
      // POST Request for multiple locations
      requestData = {
        email_format: displayFormat,
        email_list: selectedContacts,
        locations: selectedLocations.map((id) => parseInt(id, 10)), // Ensure IDs are numbers
      };
  
      try {
        const response = await api.post(query, requestData);
  
        // Display task_id in the report area
        const taskIdMessage = `
          <div class="bg-blue-100 text-blue-900 p-4 rounded shadow-md">
            <p>Report job submitted successfully!</p>
            <p><strong>Task ID:</strong> ${response.data.task_id}</p>
            <p>Please check your email for the report.</p>
          </div>
        `;
        setReportContent(taskIdMessage);
        window.scrollTo({top: 0, behavior: 'smooth'});
      } catch (error) {
        console.error('Error submitting report:', error.message);
        const errorMessage = `
          <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
            <p><strong>Error:</strong> An error occurred while submitting the report.</p>
            <p>Please try again later.</p>
          </div>
        `;
        setReportContent(errorMessage);
      }
    } else {
      // GET Request for a single location
      query = `${query}/${selectedLocations[0]}`;
  
      try {
        const response = await api.get(query);
        console.log('Report Data:', response.data);
        /*
        if(window.innerWidth < 600){
        setReportContent(response.data.replace(
          /<h1(.*?)>/g,
          '<h1 style="display:none;"$1>'
        ));
      } else {
        setReportContent(response.data);
      }*/
        setReportContent(response.data);
      } catch (error) {
        console.error('Error fetching report:', error.message);
        const errorMessage = `
          <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
            <p><strong>Error:</strong> An error occurred while fetching the report.</p>
            <p>${error.message.indexOf('404')> -1 ? 'Location not found' : error.message}</p>
            <p>Please try again later.</p>
          </div>
        `;
        setReportContent(errorMessage);
      }
    }
  };

  
  
  

  

  
  
  
  
  
  

  return (
    <div className={`w-full max-w-[${window.innerWidth}] flex mt-28  flex-col md:flex-row md:items-start text-sm  gap-2 md:h-full md:min-h-full md:p-6`}>
      <style>
        {`
        
        `}
      </style>
        
      <form onSubmit={handleSubmit} className="flex flex-col  md:max-w-[250px] bg-[white] md:rounded-[unset] min-h-full gap-6 p-4">
       
      <div className={`p-2 px-2  border rounded bg-[#128CA6] text-[white] flex gap-2 items-center`}><i class="fa fa-table"></i> Report Query</div>
        {/* Row 1 */}
        <div className="col-span-1">
          <label htmlFor="reportType" className="font-bold block text-gray-700">Report Type:</label>
          <select
            id="reportType"
            value={reportType}
            onChange={handleReportTypeChange}
            className="border border-gray-300 rounded p-2 w-full text-sm"
          >
            <Upgrade tier={4}>
            <option value="sms">Files Processed</option>
              <option value="sms">SMS Sent/Rejected</option>
              <option value="emails">Emails Sent/Rejected</option>
              <option value="billing">Billing</option>
            </Upgrade>

              {!user.is_superuser && <option value="daily">Custom</option>}
              {/*!user.is_superuser && <option value="weekly">Weekly</option>*/}
            
            {!user.is_superuser && <option value="monthly">Monthly</option>}
            {!user.is_superuser && <option value="rapidrain">RapidRain</option>}
          </select>
        </div>
        {/* Dude */}
        <div className='flex flex-col justify-start gap-4'>
        <div className={`${reportType == "monthly" ? "hidden" : ""} `}>
          <label htmlFor="fromDate" className="font-bold block text-gray-700">From:</label>
         
          <input
            type="date"
            id="fromDate"
            value={fromDate}
           
            onChange={(e) => setFromDate(e.target.value)}
            disabled={reportType == "monthly"}
            className={`border border-gray-300 rounded p-2 w-full  ${reportType == "monthly" ? 'opacity-[.1]' : ''} `}
          />
        </div>
        <div className="">
          <label htmlFor="toDate" className="font-bold block text-gray-700">{reportType === 'monthly' ? 'Choose Month:' : 'To:'}</label>
          <input
            type={reportType === 'monthly' ? 'month' : 'date'}
            id="toDate"
            value={toDate}
            onChange={handleToDateChange}
            className="border border-gray-300 rounded p-2 w-full"
            min={reportType === 'monthly' && user.tier < 2 ? lastMonth : undefined} // Disable months before last month for tier < 2
            max={reportType === 'monthly' && user.tier < 2 ? lastMonth : undefined} // Disable current month for tier < 2
          />
        </div>
        </div>
        <div className="">
          <label htmlFor="displayFormat" className="font-bold block text-gray-700">Display:</label>
          <select
            id="displayFormat"
            value={displayFormat}
            onChange={(e) => setDisplayFormat(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            
          >
            <option value="html">Formatted</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        {/* Row 3 */}
        
        {(reportType == "daily" || reportType == "monthly" || reportType == "custom") && !user.is_superuser && <div className="w-full border">
          <label htmlFor="locList" className="flex justify-between gap-2 w-full font-bold block text-gray-700"><span>Locations:</span><div><input id="all" type="checkbox" checked={selectAll} onChange={handleSelectAllChange} /><span> Select All</span></div></label>
          <select
            id="locList"
            multiple
            value={selectedLocations}
            
            onChange={(e) => {
              const options = Array.from(e.target.options);
              const selected = options.filter((option) => option.selected).map((option) => option.value);
              setSelectedLocations(selected);
              //if (selected.length > 1) setDisplayFormat('csv'); // Force CSV if more than one location
            }}
            className="border border-gray-300 w-full rounded p-2 "
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>}

        {/* Row 2 */}
        {(displayFormat == "csv" ||  selectedLocations.length > 1) && <div className="">
          <div className={`flex justify-between items-center`}>
            <label htmlFor="contacts" className="font-bold block text-gray-700">Email To:</label>
          
          </div>
         
          <EmailRowManager contacts={contacts} onModify={(emails)=> {console.log(`Contacts are ${emails}`); setSelectedContacts(emails)}}/>
        </div>}

        

        {/* Submit Button */}
        <div className="col-span-4 flex justify-center">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            {selectedLocations.length > 1 || displayFormat == "csv" ? "Email Report" : "View Report"}
          </button>
        </div>
      </form>

      {/* Report Content */}
      <div className='flex w-full justify-center items-center overflow-auto'>
      <div
  id="reportArea"
  ref={reportAreaRef}
  className={`${ reportContent ? 'border-[unset]  border-[black]':''} overflow-auto w-full`}
  dangerouslySetInnerHTML={{ __html: reportContent }}
></div>
</div>

    </div>
  );
};

export default Reports;
