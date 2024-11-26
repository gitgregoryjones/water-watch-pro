import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date());
  const [reportType, setReportType] = useState('daily');

    const user = useSelector((state) => state.userInfo.user);

    const locations = user.locations;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`From Date: ${fromDate}, To Date: ${toDate}, Report Type: ${reportType}`);
    // You can add logic to handle the form submission here
  };

  return (
    <div className="mt-[8rem] p-6 w-full flex-col justify-center items-center">
      {/* Form Row */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-4 mb-6"
      >
        {/* Report Type */}
        <div>
          <label htmlFor="reportType" className="block text-gray-700">Report Type:</label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        {/* From Date */}
        {reportType != "weekly" && reportType != "monthly" && <div className=''>
          <label htmlFor="fromDate" className="block text-gray-700">From:</label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
        </div>}

        {/* To Date */}
        <div>
          <label htmlFor="toDate" className="block text-gray-700">To:</label>
          <input
            type={reportType == "monthly" ? "month" : "date"}
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
        </div>

        
        <div>
          <label htmlFor="locList" className="block text-gray-700">Choose Location</label>
          <select
         
       
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            {
                locations.map((l)=><option value={l.id}>{l.name}</option>)
            }
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Submit
        </button>
      </form>

      {/* Iframe */}
      <iframe
        src="https://waterwatchpro.synovas.dev/html/data_by_month_pass1/2024-11/2127"
        className="w-full h-[600px] border border-gray-300 rounded"
        title="Report Data"
      />
    </div>
  );
};

export default Reports;
