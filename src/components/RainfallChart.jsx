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
import api from "../utility/api"; // Import the api utility

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
  const beginDay = new Date(today.getDate() - 2);

  const endDay = today.getDate().toString().padStart(2, "0");
function getBeginEndRange() {
  const currentDate = new Date();
  
  // Calculate end date (current date)
  const endYear = currentDate.getFullYear();
  const endMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const endDay = String(currentDate.getDate()).padStart(2, '0');

  // Calculate begin date (2 days before current date)
  const beginDate = new Date(currentDate);
  beginDate.setDate(beginDate.getDate() - 2); // Subtract 2 days
  const beginYear = beginDate.getFullYear();
  const beginMonth = String(beginDate.getMonth() + 1).padStart(2, '0');
  const beginDay = String(beginDate.getDate()).padStart(2, '0');

  // Format the range
  const beginEndRange = `${beginYear}-${beginMonth}-${beginDay}/${endYear}-${endMonth}-${endDay}`;
  return beginEndRange;
}




  const formatHeaderTimestamp = (timestamp) => {
    const [datePart, timePart] = timestamp.split(" ");
    const [year, month, day] = datePart.split("-");
    const hour = timePart.split(":")[0];
    return `${month}-${day}`;
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

      let endpoint = `/api/locations/${location.id}/hourly_data?days=3&date=${tomorrowDate}`;

      if (period === "rapidrain") {
        endpoint = `/api/locations/${location.id}/15m_data?days=3&date=${tomorrowDate}`;
      }

      if (period === "daily") {
        endpoint = `/api/locations/${location.id}/24h_data/${getBeginEndRange()}`;
      }

      try {
        const response = await api.get(endpoint); // Use the `api` utility to make GET requests

        const labels = [];
        const values = [];
        const backgroundColors = [];

        const data = response.data;

        if (period !== "daily") {
          const entries = Object.entries(data.hourly_data).reverse();

          labelsRef.current = entries.map(([key]) => key); // Store full timestamps for tooltips
          setHeader(
            `${formatHeaderTimestamp(entries[0][0])} - ${formatHeaderTimestamp(entries[entries.length - 1][0])}`
          );

          entries.forEach(([key, value], i) => {
            if (i < max) {
              labels.push(formatXAxisLabel(key)); // Adjust x-axis label based on period
              let tt = value["total"];
              values.push(tt);
              backgroundColors.push(
                tt > location.h24_threshold
                  ? tt > location.atlas14_threshold["1h"][0]
                    ? "red"
                    : "orange"
                  : "green"
              );
            }
          });
        } else {
          const days = data.total_rainfall;
          days.forEach((day) => {
            labels.push(day.date);
            values.push(day.rainfall);

            if (!location.atlas14_threshold) {
              location.atlas14_threshold = 9;
            }

            backgroundColors.push(
              day.rainfall > location.h24_threshold
                ? day.rainfall > location.atlas14_threshold["24h"][0]
                  ? "red"
                  : "orange"
                : "green"
            );
          });
        }

        const yMax = calculateYMax(values); // Dynamically calculate the Y-axis max

        setChartData({
          labels,
          datasets: [
            {
              label: "Rainfall",
              data: values,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors,
              borderWidth: 0,
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

  const scrollToLastNonZeroBar = () => {
    if (!chartData || !chartData.datasets[0].data || !chartContainerRef.current)
      return;
  
    const values = chartData.datasets[0].data;
    const lastNonZeroIndex = values.lastIndexOf(values.slice().reverse().find((value) => value > 0));
  
    if (lastNonZeroIndex !== -1) {
      const container = chartContainerRef.current;
      const barWidth = 50; // Approximate width of each bar
      const scrollPosition = lastNonZeroIndex * barWidth - container.offsetWidth / 4;
  
      container.scrollLeft = Math.max(scrollPosition, 0); // Scroll to the calculated position
    }
  };
  

  useEffect(() => {
    if (period === "hourly" && chartData) {
      scrollToLastNonZeroBar();
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
        enabled: true,
        callbacks: {
          title: () => "", // Hide the default x-axis value
          label: function (context) {
            const value = context.raw; // Sample value
            const label = labelsRef.current[context.dataIndex]; // Full date and time
            const arr = label
              ? [`${value}`, `${label.substring(0, label?.lastIndexOf(":"))}`]
              : [`${value}`, `${context.label}`];

            return arr; // Custom content for the tooltip
          },
        },
      },
    },
    animation: false,
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full flex justify-center font-bold text-lg mb-4">
        {period === "hourly" && header}
      </div>
      <div
        ref={chartContainerRef}
        className="overflow-x-auto"
        style={{ position: "relative", width: "100%", height: "420px" }}
      >
        {error ? (
          <div>Error loading data. Please try again later.</div>
        ) : chartData ? (
          <div
            tabIndex={0}
            onMouseEnter={scrollToLastNonZeroBar}
            style={{
              width: `${
                period === "daily"
                  ? window.innerWidth < 600
                    ? window.innerWidth * 0.9
                    : window.innerWidth * 0.75
                  : chartData.labels.length * 50
              }px`,
              height: "100%",
            }}
          >
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
