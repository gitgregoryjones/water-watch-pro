import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "../utility/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const RainfallChart = ({ location, period = "hourly", max = 72 }) => {
  const user = useSelector((state) => state.userInfo.user);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const chartContainerRef = useRef(null);
  const snapshotDivRef = useRef(null);
  const [hideYAxis, setHideYAxis] = useState(true); 

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = (today.getDate() ).toString().padStart(2, "0");
  const tomorrowDate = `${year}-${month}-${day}`;

  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (chartContainerRef.current) {
        setScrollPosition(chartContainerRef.current.scrollLeft);
        console.log(`Scrolled to position: ${chartContainerRef.current.scrollLeft}`);
        if(chartContainerRef.current.scrollLeft > 10){
          setHideYAxis(false)
        } else {
          setHideYAxis(true)
        }
      }
    };

    const container = chartContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    // Cleanup
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

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

  const fetchChartData = async () => {
    if (!location.id) return;
  
    let endpoint;
  
    // Determine the appropriate endpoint based on the `period`
    if (period === "rapidrain") {
      endpoint = `/api/locations/${location.id}/15m_data?days=${max}`;
    } else if (period === "daily") {
      endpoint = `/api/locations/${location.id}/24h_data/${getBeginEndRange()}`;
    } else {
      endpoint = `/api/locations/${location.id}/hourly_data?days=${max}&date=${tomorrowDate}`;
    }
  
    try {
      const response = await api.get(endpoint);
      const labels = [];
      const values = [];
      const backgroundColors = [];
  
      const data = response.data;
  
      if (period !== "daily") {
        const entries = Object.entries(data.hourly_data).reverse();
  
        entries.forEach(([key, value]) => {
          labels.push(
           period != "rapidrain" ? new Date(key).toLocaleString("en-US", {
              hour: "2-digit",
              hour12: false,
              month:'short',
              day:'numeric'
            }) + "h" : new Date(key).toLocaleString("en-US", {
             day:'numeric',
             hour: "2-digit", 
             minute:'numeric'
            }) 
          );
          values.push(value.total);
          backgroundColors.push(value.total > location.h24_threshold ? (value.total > location.atlas14_threshold["1h"][0] ? "red" : "orange") : "green");
        });
      } else {
        data.total_rainfall.forEach((day) => {
          labels.push(day.date);
          values.push(day.rainfall);
          backgroundColors.push(day.rainfall > location.h24_threshold ? "orange" : "green");
        });
      }
  
      setChartData({
        labels,
        datasets: [
          {
            label: "Rainfall",
            data: values,
            backgroundColor: backgroundColors,
          },
        ],
      });
    } catch (err) {
      setError(err.message);
    }
  };
  const scrollToLastNonZeroBar = () => {
    if (!chartData || !chartContainerRef.current) return;

    const values = chartData.datasets[0].data;
    const lastNonZeroIndex = values.lastIndexOf(values.find((value) => value > 0));

    if (lastNonZeroIndex !== -1) {
      const barWidth = 50; // Approximate width of each bar
      const scrollPosition = lastNonZeroIndex * barWidth;

      chartContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });

      console.log(`Scrolled to the last non-zero bar at index ${lastNonZeroIndex}`);
    }
  };

  useEffect(() => {
    if (chartData) {
      scrollToLastNonZeroBar();
    }
  }, [chartData]);

  const takeSnapshot = () => {
    if (!chartContainerRef.current || !snapshotDivRef.current) return;

    const canvas = chartContainerRef.current.querySelector("canvas");
    if (!canvas) return;

    const snapshotCanvas = document.createElement("canvas");
    snapshotCanvas.width = 50; // Snapshot width
    snapshotCanvas.height = canvas.height; // Full chart height

    const ctx = snapshotCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, 0, 50, canvas.height, 0, 0, 50, canvas.height);

    const dataUrl = snapshotCanvas.toDataURL();
    snapshotDivRef.current.style.backgroundImage = `url(${dataUrl})`;
    snapshotDivRef.current.style.backgroundRepeat = "no-repeat";
    snapshotDivRef.current.style.backgroundSize = "contain";
    snapshotDivRef.current.style.backgroundPosition = "center";
    //setHideYAxis(true);
  };

  useEffect(() => {
    fetchChartData();
  }, [location.id, period, max, tomorrowDate]);

  useEffect(() => {
    if (chartData) {
      setTimeout(takeSnapshot, 500); // Delay to ensure chart is rendered
    }
  }, [chartData]);

  const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: false,
      },
      ticks: {
        autoSkip: false,
      },
      grid: {
        display: true,
      },
    },
    y: {
      beginAtZero: true,
      max: chartData?.yMax || 1.0,
      ticks: {
        stepSize: 0.25,
      },
      grid: {
        display: true,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      callbacks: {
        title: () => "",
        label: function (context) {
          const value = context.raw;
          const label = labelsRef.current[context.dataIndex];
          const arr = label
            ? [`${value}`, `${label.substring(0, label?.lastIndexOf(":"))}`]
            : [`${value}`, `${context.label}`];

          return arr;
        },
      },
    },
  },
  elements: {
    bar: {
      maxBarThickness: 100, // Constrain maximum bar width
    },
  },
};


  return (
    <div className="flex flex-row w-full">
      <div ref={snapshotDivRef} className={` ${hideYAxis ? 'hidden' : ''}  h-[400px] w-[50px] bg-white`}></div>
      <div ref={chartContainerRef} className="overflow-x-auto w-full h-[400px]">
        {error ? (
          <div>Error loading data. Please try again later.</div>
        ) : chartData ? (
          <div style={{
            width: `${
              period === "daily"
                ? window.innerWidth < 600
                  ? window.innerWidth * 0.9
                  : window.innerWidth * 0.75
                : chartData.labels.length * 50
            }px`,
            height: "100%",
          }}>
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
