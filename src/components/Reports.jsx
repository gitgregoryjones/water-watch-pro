import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { API_HOST } from '../utility/constants';
import fetchContacts from '../utility/fetchContacts';
import Upgrade from './Upgrade';
import api from '../utility/api';

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
  const locations = user.locations;
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
    }
  }, [reportType, user.tier]);

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
  
    // Validation logic
    if (selectedLocations.length === 0) {
      const errorMessage = `
        <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
          <p><strong>Error:</strong> Please select at least one location.</p>
        </div>
      `;
      setReportContent(errorMessage);
      return;
    }
  
    if (reportType === 'weekly' || reportType === 'daily') {
      if (!fromDate || !toDate) {
        const errorMessage = `
          <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
            <p><strong>Error:</strong> Please specify both a from date and a to date for weekly or custom date ranges.</p>
          </div>
        `;
        setReportContent(errorMessage);
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
        setReportContent(response.data);
      } catch (error) {
        console.error('Error fetching report:', error.message);
        const errorMessage = `
          <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
            <p><strong>Error:</strong> An error occurred while fetching the report.</p>
            <p>Please try again later.</p>
          </div>
        `;
        setReportContent(errorMessage);
      }
    }
  };
  
  
  
  
  
  

  return (
    <div className="  w-full flex mt-28  flex-col md:flex-row md:items-start text-sm  gap-2 md:h-full md:min-h-full md:p-6">
        
      <form onSubmit={handleSubmit} className="flex flex-col md:max-w-[250px] bg-[white] md:rounded-[unset] min-h-full gap-6 p-4">
        {/* Row 1 */}
        <div className="col-span-1">
          <label htmlFor="reportType" className="font-bold block text-gray-700">Report Type:</label>
          <select
            id="reportType"
            value={reportType}
            onChange={handleReportTypeChange}
            className="border border-gray-300 rounded p-2 w-full text-sm"
          >
            <Upgrade showMsg={false} tier={2}>
              <option value="daily">Custom</option>
              <option value="weekly">Weekly</option>
            </Upgrade>
            <option value="monthly">Monthly</option>
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
        
        <div className="w-full border">
          <label htmlFor="locList" className="flex justify-between gap-2 w-full font-bold block text-gray-700"><span>Locations:</span><div><input id="all" type="checkbox"/><span> Select All</span></div></label>
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
        </div>

        {/* Row 2 */}
        {(displayFormat == "csv" ||  selectedLocations.length > 1) && <div className="col-span-1">
          <label htmlFor="contacts" className="font-bold block text-gray-700">Email Contacts:</label>
          <select
            id="contacts"
            multiple
            value={selectedContacts}
            onChange={(e) => {
              const options = Array.from(e.target.options);
              const selected = options.filter((option) => option.selected).map((option) => option.value);
              setSelectedContacts(selected);
            }}
            className="border border-gray-300 rounded p-2 w-full h-20"
          >
            {contacts.map((contact) => (
              <option key={contact.email} value={contact.email}>
                {contact.name}
              </option>
            ))}
          </select>
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
      <div id="reportArea"
        className="flex flex-col md:flex-[4] w-full h-[600px]  rounded mt-6  md:mt-0 p-4 overflow-auto"
        dangerouslySetInnerHTML={{ __html: reportContent }}
      ></div>
    </div>
  );
};

export default Reports;
