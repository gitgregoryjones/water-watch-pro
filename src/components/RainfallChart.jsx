import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const RainfallChart = ({ location, period = "hourly", max = 72 }) => {
  const user = useSelector((state) => state.userInfo.user);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [header, setHeader] = useState("");
  const chartContainerRef = useRef(null);
  const labelsRef = useRef([]); // Store full timestamps for tooltips

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = (today.getDate() + 1).toString().padStart(2, "0");
  const tomorrowDate = `${year}-${month}-${day}`;
  const beginDay = (today.getDate() - 2).toString().padStart(2, "0");
  const endDay = today.getDate().toString().padStart(2, "0");
  const beginEndRange = `${year}-${month}-${beginDay}/${year}-${month}-${endDay}`;

  const [firstTime,setFirstTime] = useState(true);

  const formatHeaderTimestamp = (timestamp) => {
    const [datePart, timePart] = timestamp.split(" ");
    const [year, month, day] = datePart.split("-");
    const hour = timePart.split(":")[0];
    return `${month}-${day} ${hour}h`;
  };

  const formatXAxisLabel = (timestamp) => {
    const [, timePart] = timestamp.split(" ");
    if (period === "rapidrain") {
      const minute = timePart.split(":")[1]; // Extract the minute
      return `${minute}m`; // Label as "45m"
    }
    const hour = timePart.split(":")[0];
    return `${hour}h`; // Label as "12h"
  };

  const calculateYMax = (data) => {
    const nonZeroMax = Math.max(...data.filter((value) => value > 0));
    return nonZeroMax > 0 ? nonZeroMax : 1.0;
  };

  useEffect(() => {
    const fetchData = async () => {
      setError(null);

      if (!location.id) {
        return;
      }

      let API_URL = `https://waterwatchpro.synovas.dev/api/locations/${location.id}/hourly_data?days=3&date=${tomorrowDate}`;

      if (period === "rapidrain") {
        API_URL = `https://waterwatchpro.synovas.dev/api/locations/${location.id}/15m_data?days=3&date=${tomorrowDate}`;
      }

      if (period === "daily") {
        API_URL = `https://waterwatchpro.synovas.dev/api/locations/${location.id}/24h_data/${beginEndRange}`;
      }

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data for location ${location.id}: ${response.statusText}`);
        }

        const labels = [];
        const values = [];

        const data = await response.json();

        if (period !== "daily") {
          const entries = Object.entries(data.hourly_data).reverse();

          labelsRef.current = entries.map(([key]) => key); // Store full timestamps for tooltips
          setHeader(
            `${formatHeaderTimestamp(entries[0][0])} - ${formatHeaderTimestamp(entries[entries.length - 1][0])}`
          );

          entries.forEach(([key, value], i) => {
            if (i < max) {
              labels.push(formatXAxisLabel(key)); // Adjust x-axis label based on period
              values.push(value["total"]);
            }
          });
        } else {
          const days = data.total_rainfall;
          days.forEach((day) => {
            labels.push(day.date);
            values.push(day.rainfall);
          });
        }

        const yMax = calculateYMax(values); // Dynamically calculate the Y-axis max

        setChartData({
          labels,
          datasets: [
            {
              label: "Rainfall",
              data: values,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
          yMax: yMax * 1.2,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.id, period, max, tomorrowDate]);

  const scrollToFirstNonZeroBar = () => {

    
    if (!chartData || !chartData.datasets[0].data || !chartContainerRef.current) return;

    const values = chartData.datasets[0].data;
    const firstNonZeroIndex = values.findIndex((value) => value > 0);

    if (firstNonZeroIndex !== -1) {
      const container = chartContainerRef.current;
      const barWidth = 50; // Approximate width of each bar
      const scrollPosition = firstNonZeroIndex * barWidth - container.offsetWidth / 4;
      

     // setTimeout(() => {
      
        container.scrollLeft = Math.max(scrollPosition, 0); // Scroll to the calculated position
        
     // }, 1000); // Add a delay to ensure rendering is complete
    }
  };


  useEffect(() => {
    if (period === "hourly" && chartData) {
      scrollToFirstNonZeroBar();
    }
  }, [period, chartData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: false, // No title for x-axis
        },
        ticks: {
          autoSkip: false, // Ensure all labels appear
        },
        grid: {
          display: true, // Show gridlines for x-axis
        },
      },
      y: {
        beginAtZero: true,
        max: chartData?.yMax || 1.0, // Use calculated max value
        ticks: {
          stepSize: 0.5,
        },
        grid: {
          display: true, // Show gridlines for y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        callbacks: {
          title: () => '', // Hide the default x-axis value
          label: function (context) {
            const value = context.raw; // Sample value
            const label = labelsRef.current[context.dataIndex]; // Full date and time
            return [`Value: ${value}`, `Date: ${label}`]; // Custom content for the tooltip
          },
        },
      },
    },
    animation: false,
  };

  return (
    <div className="flex flex-col w-full">
      {/* Dynamic Header */}
      <div className="w-full flex justify-center font-bold text-lg mb-4">{period === "hourly" && header}</div>

      {/* Scrollable Chart */}
      <div
        ref={chartContainerRef}
        className="overflow-x-auto"
        style={{ position: "relative", width: "100%", height: "420px" }}
      >
        {chartData ? (
          <div tabIndex={0}  onMouseEnter={scrollToFirstNonZeroBar} style={{ width: `${period === "daily" ? (window.innerWidth < 600 ? window.innerWidth * 0.9 : window.innerWidth * 0.75) : chartData.labels.length * 50}px`, height: "100%" }}>
            <Bar data={chartData} options={options} />
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default RainfallChart;
