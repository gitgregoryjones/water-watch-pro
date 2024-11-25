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

      const API_URL = `https://waterwatchpro.synovas.dev/api/locations/${location.id}/hourly_data?days=3&date=${tomorrowDate}`;
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
        Object.entries(data.hourly_data).forEach(([key, value]) => {
          transformedData.push([
            key, // Full date as the time
            period === 'daily' ? value['24h_total'] : value['total'], // Use 24h_total or total
          ]);
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
          legend: { position: "bottom" },
          curveType: "function",
          width: window.innerWidth < 600 ? window.innerWidth : window.innerWidth * 0.75,
          height: 420,
        }}
      />
    </div>
  );
};

export default RainfallChart;
