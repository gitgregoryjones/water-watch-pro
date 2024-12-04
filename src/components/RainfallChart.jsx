import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

import { Bar } from "react-chartjs-2";
import api from "../utility/api"; // Import the api utility

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const RainfallChart = ({ location, period = "hourly", max = 72, overlay = 1 }) => {
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

      let endpoint = `/api/locations/${location.id}/hourly_data?days=${max}&date=${tomorrowDate}`;

      if (period === "rapidrain") {
        endpoint = `/api/locations/${location.id}/15m_data?days=${max}&date=${tomorrowDate}`;
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

        if (period != "daily") {
          const entries = Object.entries(data.hourly_data).reverse();

          labelsRef.current = entries.map(([key]) => key); // Store full timestamps for tooltips
          setHeader(
            `${formatHeaderTimestamp(entries[0][0])} - ${formatHeaderTimestamp(entries[entries.length - 1][0])}`
          );

          entries.forEach(([key, value], i) => {
            if (i < max * 24) {
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

          const chartAreaBackground = {
            id: "chartAreaBackground",
            beforeDraw(chart) {
              const { ctx, chartArea, scales } = chart;
              const { left, right, top, bottom } = chartArea;
          
              const labels = labelsRef.current; // Ensure this is populated with full timestamps
          
              // Extract unique days and their indices
              const uniqueDays = labels.reduce((unique, dateString, index) => {
                const day = dateString.split(" ")[0];
                if (!unique.some((item) => item.day === day)) {
                  unique.push({ day, startIndex: index });
                }
                return unique;
              }, []);
          
              // Determine the width of each bar
              const barWidth = (right - left) / labels.length;
          
              uniqueDays.pop();
              // Calculate positions for the dates
              const datePositions = uniqueDays.map(({ day, startIndex }, idx) => {
                const nextStartIndex =
                  idx < uniqueDays.length - 1 ? uniqueDays[idx + 1].startIndex : labels.length;
          
                // Calculate the center of the current 24-hour period
                const centerIndex = startIndex + Math.floor((nextStartIndex - startIndex) / 2);
                const centerX = left + centerIndex * barWidth + barWidth / 2 + 100;
          
                return { day, x: centerX };
              });
          
              // Draw the dates
              ctx.save();
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.font = "16px Arial";
              ctx.fillStyle = "black";
          
              
             datePositions.forEach(({ day, x }) => {
                const centerY = top + (bottom - top) / 2; // Center vertically
                
                ctx.fillText(day, x, centerY);
              });
          
              ctx.restore();
            },
          };
          
          
          
  
  // Register the plugin
  ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, chartAreaBackground);
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

    
    if (!chartData || !chartData.datasets[0].data || !chartContainerRef.current) return;

 
    const values = chartData.datasets[0].data;
    const lastNonZeroIndex = values.lastIndexOf(values.find((value) => value > 0));

    if (lastNonZeroIndex !== -1) {
      const container = chartContainerRef.current;
      const barWidth = 50; // Approximate width of each bar
      const scrollPosition = lastNonZeroIndex * barWidth - container.offsetWidth / 4;
// Debugging logs
console.log("Bar Width:", barWidth);
console.log("Scroll Position:", scrollPosition, container.scrollLeft, container.scrollTop);
console.log("Container Width:", container.clientWidth);

// Apply the scroll position
container.scrollTo({
  left: scrollPosition,
  top:scrollPosition,
  behavior: "smooth", // Adds smooth scrolling
});

console.log("Scroll Position After:", scrollPosition, container.scrollLeft, container.scrollTop);

    }
  }
  

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
        display:false
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
  };

    
  const yAxisCanvasRef = useRef(null);
  
  useEffect(() => {
    const drawYAxis = () => {
      const canvas = yAxisCanvasRef.current;
      if (!canvas || !chartData) return; // Ensure canvas and data are ready
    
      //const ctx = canvas.getContext("2d");
      const chartHeight = 420; // Total height of the chart area
      const xAxisHeight = 30; // Estimated height of the X-axis labels row
      const usableHeight = chartHeight - xAxisHeight; // Adjust for X-axis labels
    
      // Calculate min and max values
      const dataValues = chartData.datasets[0].data; // Assume the data series is in the first dataset
      const maxValue = Math.max(...dataValues, 0); // Get the maximum value in the dataset
      console.log(`period is ${period} and maxValue is ${maxValue}`)
      const tickStep = 0.25; // Increment by 0.25
      const tickValues = [];
    
      // Generate tick values from 0 to greater than maxValue
      for (let i = 0; i <= maxValue + 0.25; i += tickStep) {
        tickValues.push(i);
      }

      console.log(`period is ${period} and tickValues is ${tickValues} `)
    
      const stepHeight = usableHeight / (tickValues.length - 1); // Space between ticks
    
      canvas.width = 50;
      canvas.height = chartHeight;
    
      //clear old values
      canvas.innerHTML = "";
    
      tickValues.reverse().forEach((value, i) => {
        const y = usableHeight - i * stepHeight * .85; // Align ticks within usable space
        //ctx.fillText(value.toFixed(2), 40, y); // Draw tick value with two decimal places
        let d = document.createElement("div")
        if(tickValues[i+1] == undefined){
          d.setAttribute("class",`relative top-[0px]`)
        }
        d.innerHTML = value.toFixed(2);
        canvas.append(d)
      });
    };
    
    if (chartData) drawYAxis(); // Ensure chartData is ready before drawing
  }, [chartData]);
  

  return (
    <div className="flex flex-row w-full">
    
      <div ref={yAxisCanvasRef} className=" flex flex-col justify-between h-[380px] relative">TACO MEAT</div>
      <div
        ref={chartContainerRef}
        className="overflow-x-auto"
        style={{ position: "relative", width: "100%", height: "25rem" }}
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
