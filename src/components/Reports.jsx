import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { API_HOST, VITE_PRICES_LINK, VITE_FEATURE_EXCEL_REPORT, VITE_FEATURE_PDF_REPORT } from '../utility/constants';
import fetchContacts from '../utility/fetchContacts';
import Upgrade from './Upgrade';
import api from '../utility/api';
import apiCSV from '../utility/apiCSV';
import EmailRowManager from './EmailRowManager';
import { convertTier } from '../utility/loginUser';
import WorkingDialog from './WorkingDialog';
import { colorLoggedInUserLocations } from '../utility/loginUser';
import fetchByPage from '../utility/fetchByPage';
import MultiSelectDropdown from './MultiSelectDropdown';
import { Link } from 'react-router-dom';


const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today's date
  
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [displayFormat, setDisplayFormat] = useState('html'); // 'html' or 'csv'
  const [reportContent, setReportContent] = useState(''); // HTML content for the report
  const [contacts, setContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false); 
  const [showDialog,setShowDialog] = useState(false);
  const [searchTerm,setSearchTerm] = useState("")
  const [smsStatus, setSmsStatus] = useState("all")
  

  const user = useSelector((state) => state.userInfo.user);
  const [reportType, setReportType] = useState(user.is_superuser ? 'sms' :'monthly');
  
  const [locations, setLocations] = useState([])
  const reportAreaRef = useRef(null);


  const currentDate = new Date();
  const currentYearMonth = currentDate.toISOString().slice(0, 7); // Get current month in YYYY-MM
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    .toISOString()
    .slice(0, 7); // Get last month in YYYY-MM
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    .toISOString()
    .slice(0, 7); // Get last month in YYYY-MM
  
  
    useEffect(() => {
      // Fetch locations asynchronously
      const fetchLocations = async () => {
        setShowDialog(true)
   
        try {
          
          let rows = await fetchByPage(`/api/locations${user.clients.length > 1 ? `?client_id=${user.clients[0].id}`:``}`)
          setLocations(rows)
         
          setShowDialog(false)
        } catch (error) {
          console.error('Failed to fetch locations:', error);
          
         
          setShowDialog(false)
        }
      };
    
      fetchLocations();
    }, []);

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
      
      if (convertTier(user) <= 2) {
        setToDate(lastMonth); // Default to last month if tier < 2
      
      } else {
        setToDate(currentYearMonth); // Default to current month if tier >= 2
      }
    } else if(reportType == 'weekly' && convertTier(user) < 2){

      setReportContent(`
        <center><div class="flex flex-col gap-4  items-center justify-center bg-[white] text-center border-[gold]  border-4 text-slate-900 p-4 rounded shadow-md  h-[20rem] md:w-[40rem]">
          This feature is not available at your current service level
          <p>
          <a href="${VITE_PRICES_LINK}?ref=/reports">Click Here to Upgrade</a>
        </div></center>
      `)

    }else if((reportType == 'daily' || reportType == 'rapidrain') && convertTier(user) < 2){

      setReportContent(`
        <center><div class="items-center flex-col gap-4 justify-center bg-[white] border-[gold] border-4 flex justify-center items-center text-center text-slate-900 p-4 rounded shadow-md  h-[20rem] md:w-[40rem]">
          This feature is not available at your current service level
          <p>
          <a href="${VITE_PRICES_LINK}?ref=/reports">Click Here to Upgrade</a>
        </div></center>
      `)

    }
  }, [reportType, convertTier(user)]);

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
      if (convertTier(user) < 2) {
        setToDate(lastMonth); // Default to last month
      } else {
        setToDate(currentYearMonth); // Default to current month
      }
      setFromDate(''); // Clear From date
    } else if (selectedType === 'weekly' || selectedType === "sms") {
      
      const currentDate = new Date(toDate);
      const pastDate = new Date(currentDate);
      pastDate.setDate(currentDate.getDate() - 7);
      setFromDate(pastDate.toISOString().slice(0, 10));
      //setToDate(new Date().toISOString().slice(0, 10))
    } else if(selectedType === "historical"){

      setFromDate('2022-11-01')
      setToDate('2024-10-31')

    }else {
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


    const oldDate = new Date(selectedDate);
    const cutoff = new Date('2024-11-01');


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

    const notImplemented = ["unpaid","billing","files-processed"]

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
  
    if (reportType === 'weekly' || reportType === 'daily' || reportType === "historical" ||  reportType === 'rapidrain' || reportType == 'emails') {
      if (!fromDate || !toDate) {
        const errorMessage = `
          <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
            <p><strong>Error:</strong> Please specify both a from date and a to date for this report.</p>
          </div>
        `;
        setReportContent(errorMessage);
        window.scrollTo({top: 0, behavior: 'smooth'});
        return;
      }
    }
  
    if ((displayFormat === 'csv' || displayFormat == 'pdf' || displayFormat == 'excel' || selectedLocations.length > 1) && selectedContacts.length === 0) {
      const errorMessage = `
        <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
          <p><strong>Error:</strong> Please select at least one contact when generating a PDF,EXCEL,or CSV report or any report with  multiple locations.</p>
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

    if(reportType === "historical"){
      let confirmed = window.confirm("Please confirm you wish to submit this Historical Report request and pay the fee.");
      if(!confirmed){
        return;
      }
    }
  
    let query = '';
    let requestData = null;


  
    if (reportType === 'monthly') {
      const [year, month] = toDate.split('-'); // Extract year and month
      const firstDay = `${year}-${month}-01`; // First day of the month
      const lastDay = new Date(year, month, 0).toISOString().slice(0, 10); // Last day of the month
  
      console.log(`Computed From Date: ${firstDay}, To Date: ${lastDay}`);
      query = `${API_HOST}/api/reports/data_by_date_range/${firstDay}/${lastDay}`;
    } else if (reportType === 'weekly' || reportType === 'daily' || reportType === "historical") {
      //query = `${API_HOST}/api/reports/data_by_date_range/${fromDate}/${toDate}?historical=${reportType === "historical"}`;
       query = `${API_HOST}/api/reports/data_by_date_range/${fromDate}/${toDate}`;
    } else if (reportType === 'rapidrain'){
      query = `${API_HOST}/api/reports/rapidrain_by_date_range/${fromDate}/${toDate}`;
      
    } else if(reportType === 'emails'){
      query = `${API_HOST}/api/reports/sockletlabs-email-report?format=${displayFormat}&start_date=${fromDate}&end_date=${toDate}&page_size=250&page_number=1&sort_field=queuedTime&sort_directin=asc`
    }  else if(reportType === 'sms'){

       query = `${API_HOST}/api/reports/sms?format=${displayFormat}&status=${smsStatus}&start_date=${fromDate}&end_date=${toDate}&sort_field=queuedTime&sort_directin=asc`

    }

  

    requestData = {
      email_format: displayFormat,
      email_list: selectedContacts,
      locations: selectedLocations.map((id) => parseInt(id, 10)), // Ensure IDs are numbers
    };
   
    setShowDialog(true);
    if ( (selectedLocations.length > 1 || displayFormat === 'csv' ||  displayFormat == 'excel') ) {
      // POST Request for multiple locations
     

      if(reportType == "sms" || reportType == "emails"){

        requestData = selectedContacts;
      }
  
      try {
        const response =  await api.post(query, requestData);

        setShowDialog(false);
  
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
        setShowDialog(false)
        console.error('Error submitting report:', error.message);
        const errorMessage = `
          <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
            <p><strong>Error:</strong> An error occurred while submitting the report</p>
            <p>${error.message}</p>
            
          </div>
        `;

        setReportContent(errorMessage);
      }
    } else {
      // GET Request for a single location
      if(reportType !=="sms"){

        query = `${query}/${selectedLocations[0]}`;
      } else {

        //don't append anything to query
      }
  
      try {
     
        const response = await api.get(query);
        console.log('Report Data:', response.data);

        if(requestData.email_list.length > 0){
          console.log(`Trying to email one location`)
          const response =  await api.post(query.substring(0, query.lastIndexOf("/")), requestData);
        }

        setShowDialog(false);

        
        /*
        if(window.innerWidth < 600){
        setReportContent(response.data.replace(
          /<h1(.*?)>/g,
          '<h1 style="display:none;"$1>'
        ));
      } else {
        setReportContent(response.data);
      }*/
        setReportContent(`<div style="${requestData.email_list.length > 0 ? '' : 'display:none;'} width:100%; font-weight:bold; background-color:blue; padding:2rem; color:white; background-color:red">Attention: The Report was also sent to ${JSON.stringify(requestData.email_list)}</div>` + response.data);
      } catch (error) {
        setShowDialog(false);
        console.log('Error fetching report:', error.message);
        const errorMessage = `
          <div class="bg-red-100 text-red-900 p-4 rounded shadow-md">
            <p><strong>Error:</strong> An error occurred while fetching the report.</p>
            <p>${error.message.indexOf('404')> -1 ? 'Location not found' : reportType === "emails" ?`${error.message} due to missing test data` :error.message}</p>
            <p>Please try again later.</p>
          </div>
        `;
        setReportContent(errorMessage);
      }
    }
  };

  
  
  

  

  
  
  const filterLocations = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Automatically select matching options
    const matchingLocations = locations
      .filter((l) => l.name.toLowerCase().includes(term.toLowerCase()))
      .map((l) => l.id);

    setSelectedLocations(matchingLocations);
  };

  const filtered = locations.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  
  
  

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
            {/*<option value="files-processed">Files Processed</option>*/}
              <option value="sms">SMS Sent/Rejected</option>
              <option value="emails">Rejected Emails</option>
              {1==0 && <option value="billing">Billing</option>}
            </Upgrade>
            {/*<option value="historical">Historical Data</option>*/}

              {!user.is_superuser && <option value="daily">Custom</option>}
              {/*!user.is_superuser && <option value="weekly">Weekly</option>*/}
            
            {!user.is_superuser && <option value="monthly">Monthly</option>}
            {!user.is_superuser && <option value="rapidrain">RapidRain</option>}
          </select>
        </div>
        {reportType === "sms" && <div className="col-span-1">
        <label htmlFor="smsStatus" className="font-bold block text-gray-700">Text Status:</label>
        <select
            id="smsStatus"
            value={smsStatus}
            onChange={(e)=> setSmsStatus(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full text-sm"
          >
           <option value="all">All</option>
           <option value="failed">Failed</option>
           <option value="delivered">Delivered</option>
           <option value="received">Received</option>
           <option value="undelivered">Undelivered</option>
        </select>
        </div>}
        {/* Dude */}
        <div className='flex flex-col justify-start gap-4'>
        <div className={`${reportType == "monthly" ? "hidden" : ""} `}>
          <label htmlFor="fromDate" className="font-bold block text-gray-700">From:</label>
         
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            min={"2022-11-01"}
            
            onChange={(e) => setFromDate(e.target.value)}
            disabled={reportType == "monthly"}
            className={`border border-gray-300 rounded p-2 w-full  ${reportType == "monthly" ? 'opacity-[.1]' : ''} `}
          />
        </div>
        <div className="">
          <label htmlFor="toDate" className="font-bold block text-gray-700">{reportType === 'monthly' ? 'Choose Month:' : 'To:'}</label>
         
          {reportType != "historical" && <input
            type={reportType === 'monthly' ? 'month' : 'date'}
            id="toDate"
            value={toDate}
            onChange={handleToDateChange}
            className="border border-gray-300 rounded p-2 w-full"
            min={reportType === 'monthly' && convertTier(user) < 2 ? "2024-11" : "2024-11"} // Disable months before last month for tier < 2
            max={reportType === 'monthly' && convertTier(user) < 3 ? lastMonth : thisMonth} // Disable current month for tier < 2
          />}
            {reportType === "historical" && <input
          type="date"
          id="toDate"
          value={toDate}
          onChange={handleToDateChange}
          className="border border-gray-300 rounded p-2 w-full"
          min="2022-11-01"
          max="2024-10-31"
        />}
        </div>
        {new Date(toDate) < new Date('2024-11-01') && <div className='px-4 py-1 items-center justify-center rounded border-[gold] border-2  text-start'>Historical reports before November 2024 are charged a fee.
          </div>}
        {convertTier(user) < 3 && 
          <div className='px-4 py-1 items-center justify-center rounded border-[gold] border-2  text-start'>Want to run reports for all of {new Date().toLocaleDateString('en-US', {
              month: 'long',              
            }) }?  Upgrade <Link to={"/upgrade"}  state={{url: "/reports"}}>here</Link>
          </div>}
        </div>
        <div className="">
          <label htmlFor="displayFormat" className="font-bold block text-gray-700">Display:</label>
          <select
            id="displayFormat"
            value={displayFormat}
            onChange={(e) => setDisplayFormat(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            
          >
            {reportType != "historical" && <option value="html">Formatted</option>}
            {<option value="csv">CSV</option>}
            {VITE_FEATURE_PDF_REPORT == "true" && reportType != "sms" && reportType != "emails" && <option value="pdf">PDF</option>}
            {VITE_FEATURE_EXCEL_REPORT  === "true" && reportType != "sms" && reportType != "emails" &&  <option value="excel">Excel</option>}
          </select>
        </div>

        {/* Row 3 */}
        
        {(reportType == "daily" || reportType=== "historical" ||reportType == "rapidrain" || reportType == "monthly" || reportType == "custom") && !user.is_superuser && <div className="w-full  min-w-[12rem]">
          <label htmlFor="locList" className="hidden md:flex justify-between gap-2 w-full font-bold block text-gray-700"><span>Locations: ({selectedLocations.length})</span><div><input id="all" type="checkbox" checked={selectAll} onChange={handleSelectAllChange} /><span> Select All</span></div></label>
          <select
        id="locList"
        multiple
        value={selectedLocations}
        onChange={(e) => {
          const options = Array.from(e.target.options);
          const selected = options
            .filter((option) => option.selected)
            .map((option) => parseInt(option.value, 10));
          setSelectedLocations(selected);
        }}
        className="hidden md:block border border-gray-300 w-full rounded p-2"
      >
        {filtered.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        className="hidden md:block p-2 mt-2 w-full border border-green-800 rounded text-md placeholder-[black]"
        onChange={filterLocations}
        placeholder="Search Locations..."
        value={searchTerm}
      />
      <div className={`md:hidden flex w-full flex-col`}>
        <div>Locations</div>
        <MultiSelectDropdown className={``} locations={filtered} onSelectedOption={(list)=> { console.log(`I see list ${JSON.stringify(list)}`); setSelectedLocations(list)} }/>
      </div>
        </div>}

        {/* Row 2 */}
        {(displayFormat == "csv" ||  displayFormat == "excel" || displayFormat == "html" || displayFormat == "pdf" || selectedLocations.length > 1) && <div className="hidden md:flex  flex-col">
          <div className={`flex justify-between items-center`}>
            <label htmlFor="contacts" className="font-bold block text-gray-700">Email To:</label>
          
          </div>
         
          <EmailRowManager contacts={contacts} onModify={(emails)=> {console.log(`Contacts are ${emails}`); setSelectedContacts(emails)}}/>
        </div>}

        {(displayFormat == "csv" || displayFormat == "excel" || selectedLocations.length > 1) && 
          <div className={`md:hidden flex w-full flex-col`}>
          <div>EmailTo</div>
          <MultiSelectDropdown className={``} locations={contacts} idField={"email"} onSelectedOption={(emails)=> {console.log(`Contacts are ${emails}`); reportType === "historical" ? setSelectedContacts([...emails,"support@waterwatchpro.com"]) : setSelectedContacts(emails)}}/>
        </div>}

        

        {/* Submit Button */}
        <div className="col-span-4 flex justify-center">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            {selectedLocations.length > 1 || displayFormat == "csv"  || displayFormat == "excel" ? "Email Report" : "View Report"}
          </button>
        </div>
      </form>

      {/* Report Content */}
      <div className='flex w-full justify-center items-start overflow-auto'>
      <div
  id="reportArea"
  ref={reportAreaRef}
  className={`${ reportContent ? 'border-[unset]  border-[black]':''} overflow-auto w-full  h-[700px]`}
  dangerouslySetInnerHTML={{ __html: reportContent }}
></div>
<WorkingDialog showDialog={showDialog}/>
</div>

    </div>
  );
};

export default Reports;
