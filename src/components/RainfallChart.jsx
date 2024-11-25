import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Chart } from "react-google-charts";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const RainfallChart = ({ location, period = 'hourly' }) => {
  const user = useSelector(state => state.userInfo.user); // Access user from Redux state
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 600);

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const tomorrowDate = `${year}-${month}-${day}`;

  const convertTimestamp = (timestamp, rapidrain) => {
    const [datePart, timePart] = timestamp.split(' '); // Split the date and time
    const day = datePart.split('-')[2]; // Extract the day from the date
    const hour = timePart.split(':')[0]; // Extract the hour from the time
    const min = timePart.split(":")[1]

    if(rapidrain){

      return `${min}m`;

    } else
  
    return `${day}d ${hour}h`; // Format as "24d 00h"
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 600);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setError(null);

      if(!location.id){
        return
      }


      let API_URL = `https://waterwatchpro.synovas.dev/api/locations/${location.id}/hourly_data?days=3&date=${tomorrowDate}`;

      if(period == "rapidrain"){

        API_URL = `https://waterwatchpro.synovas.dev/api/locations/${location.id}/15m_data?days=3&date=${tomorrowDate}`
      }

      try {
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data for location ${location.id}: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform the hourly data for chart
        const transformedData = [["Time", "Rainfall"]];

        let rr = ["45","30","15","00"];

        let over = [];

        Object.entries(data.hourly_data).forEach(([key, value],i) => {
          let q = [
            convertTimestamp(key,period == "rapidrain"), // Full date as the time
            period === 'daily' ? parseInt(value['24h_total']) : parseInt(value['total']), // Use 24h_total or total
          ];
          /*
          if(period == "rapidrain"){
              over = rr.pop();
              transformedData[transformedData.length] = [i,q[1]]
          }else {
            transformedData.push(q)
          }*/

          transformedData.push(q)


        });

        setChartData(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Render the table for mobile view
  if (isMobileView) {
    return (
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead className="sticky top-0 bg-gray-100">
            <tr>
  
              <th  style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Rainfall</th>
            </tr>
          </thead>
          <tbody>
            {chartData.slice(1).map(([time, rainfall], index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{time}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{rainfall}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Render the chart for larger screens
  return (
    <div>
      <Chart
        chartType="ColumnChart"
        data={chartData}
        options={{
          title: `Rainfall (${period}) for ${location.name}`,
          hAxis: { title: "Time" },
          vAxis: { title: "Rainfall (inches)" },
          legend: { position: "top" },
          curveType: "function",
          width: window.innerWidth < 600 ? window.innerWidth : window.innerWidth * 0.75,
          height: 420,
        }}
      />
    </div>
  );
};

export default RainfallChart;
