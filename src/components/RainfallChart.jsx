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
  const user = useSelector((state) => state.userInfo.user); // Access user from Redux state
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
              values.push(period === "daily" ? value["24h_total"] : value["total"]);
            }
          });
        } else {
          const days = data.total_rainfall;
          days.forEach((day) => {
            labels.push(day.date);
            values.push(day.rainfall);
          });
        }

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
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.id, period, max, tomorrowDate]);

  const handleScroll = () => {
    if (!chartContainerRef.current || !chartData) return;

    const scrollLeft = chartContainerRef.current.scrollLeft;
    const containerWidth = chartContainerRef.current.offsetWidth;
    const totalWidth = chartContainerRef.current.scrollWidth;

    const visibleStartIndex = Math.floor((scrollLeft / totalWidth) * (chartData.labels.length - 1));
    const visibleEndIndex = Math.min(
      Math.ceil(((scrollLeft + containerWidth) / totalWidth) * (chartData.labels.length - 1)),
      chartData.labels.length - 1
    );

    if (labelsRef.current.length > 1) {
      setHeader(
        `${formatHeaderTimestamp(labelsRef.current[visibleStartIndex])} - ${formatHeaderTimestamp(labelsRef.current[visibleEndIndex])}`
      );
    }
  };

  useEffect(() => {
    const container = chartContainerRef.current;

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [chartData]); // Attach the scroll listener when chartData is ready

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
        max: 1,
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
          label: function (context) {
            const label = labelsRef.current[context.dataIndex]; // Get full timestamp
            const value = context.raw; // Rainfall value
            return `${label != undefined ? label + ":" :' '} ${value}`;
          },
        },
      },
    },
    layout: {
      padding: {
        left: 0, // Leave space for the y-axis to remain visible
      },
    },
  };

  return (
    <div className="flex flex-col w-full">
      {/* Dynamic Header */}
      <div className="w-full flex justify-center font-bold text-lg mb-4">{header}</div>

      {/* Scrollable Chart */}
      <div
        ref={chartContainerRef}
        className="overflow-x-auto"
        style={{ position: "relative", width: "100%", height: "420px" }}
      >
        <div style={{ width: `${period === "daily" ? ( window.innerWidth < 600 ? window.innerWidth * 0.9 : window.innerWidth * 0.75) : chartData.labels.length * 50}px`, height: "100%" }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default RainfallChart;
