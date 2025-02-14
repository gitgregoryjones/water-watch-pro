import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "../utility/api";
import { convertTier } from "../utility/loginUser";



const RainfallChart = ({ location, period, max = 72 }) => {
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

  const [speriod,setSperiod] = useState(period)

  const [originalKeys, setOriginalKeys] = useState([]);

  const [scrollPosition, setScrollPosition] = useState(0);

  const barValuePlugin = {
    id: 'barValuePlugin',
    afterDraw(chart) {
      const { ctx } = chart;
      const datasets = chart.data.datasets;
      const labels = chart.data.labels;
      const period = chart.options.plugins.customPeriod; // Access the dynamic period
  
      datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
  
        meta.data.forEach((bar, index) => {
          if (bar && bar.height > 0) { // Only if the bar exists and has a height
            const dateLabel = labels[index];
            const formattedDate = new Date(dateLabel).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
            });
  
            ctx.save();
            ctx.font = '12px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
  
            const x = bar.x; // X position of the bar
            const y = bar.base - bar.height + 20; // Center Y position in the bar
            if (period !== 'daily') {
              ctx.fillText(period == "rapidrain" ? dateLabel.split(",")[0] : formattedDate, x, y); // Draw the formatted date inside the bar
            }
            ctx.restore();
          }
        });
      });
    },
  };
  


  ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);
  //ChartJS.register(barValuePlugin);

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

  const formatDate = (key) => {
    const date = new Date(key);
  
    // Extract specific parts of the date
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.toLocaleString("en-US", { day: "numeric" });
    const hour = date.toLocaleString("en-US", { hour: "numeric", hour12: true });
  
    // Construct the desired format
    return `${month} ${day}, ${hour.replace(" ","").substring(0,hour.length-2)}`;
    //return `${month} ${day}, ${hour}`;
  };
  

  const fetchChartData = async () => {
    if (!location.id) return;
  
    let endpoint;
  
    // Determine the appropriate endpoint based on the `period`
    if (period === "rapidrain") {
      endpoint = `/api/locations/${location.id}/15m_data?hours=${max}`;
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
      const keys = []; 
  
      const data = response.data;

      
  
      if (period !== "daily") {

        const entries = Object.entries(data.hourly_data).reverse();

        
  
        entries.forEach(([key, value]) => {
          keys.push(key);
          labels.push(
           period != "rapidrain" ? formatDate(key)
           : new Date(key).toLocaleString("en-US", {
              month:'numeric',
             day:'numeric',
             hour: "2-digit", 
             minute:'numeric'
            }) 
          );
          values.push(value.total);
          backgroundColors.push(value.total > location.h24_threshold ? location.atlas14_threshold && value.total > location.atlas14_threshold["1h"][0] &&  convertTier(user)  != 1 ? "red" : "orange" : "green");
        });
      } else {
        data.total_rainfall.forEach((day) => {
          keys.push(day.date);
          labels.push(day.date);
          values.push(day.rainfall);
          backgroundColors.push(day.rainfall > location.h24_threshold ? location.atlas14_threshold && day.rainfall > location.atlas14_threshold["24h"][0] && convertTier(user)  != 1 ? "red" : "orange" : "green");
        });
      }
      setOriginalKeys(keys); 
      setChartData({
        labels,
        datasets: [
          {
            label: "Rainfall",
            data: values,
            maxBarThickness: 150,
            
            
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
    const theWidth = window.innerWidth < 600 ? 150 : 110;
    snapshotCanvas.width = theWidth; // Snapshot width
    snapshotCanvas.height = canvas.height; // Full chart height

    const ctx = snapshotCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, 0, theWidth, canvas.height, 0, 0, theWidth, canvas.height);

    const dataUrl = snapshotCanvas.toDataURL();
    snapshotDivRef.current.style.backgroundImage = `url(${dataUrl})`;
    snapshotDivRef.current.style.backgroundRepeat = "no-repeat";
    snapshotDivRef.current.style.backgroundSize = "cover";
    snapshotDivRef.current.style.backgroundPosition = "center";
    //setHideYAxis(true);
  };

  useEffect(() => {
    fetchChartData();
  }, [ location.id,period]);

  useEffect(() => {
    if (chartData) {
      setTimeout(takeSnapshot, 500); // Delay to ensure chart is rendered
    }
  }, [chartData,period]);
  

  const dayChangeBackgroundPlugin = {
    id: "dayChangeBackgroundPlugin",
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      const { left, right, top, bottom } = chartArea;
      const xScale = scales.x;
  
      // Ensure originalKeys is available and valid
      const originalKeys = chart.config.options.plugins.originalKeys;
      const customPeriod = chart.config.options.plugins.customPeriod;
      if (!originalKeys || originalKeys.length === 0) return;
  
      ctx.save();
  
      let currentDay = null;
      let currentColorIndex = 0;
      const colors = ["#C5D7EF", "#D6E3F7", "#F1F6FA"].reverse(); // Background colors
      let color = null;
  
      originalKeys.forEach((key, index) => {
        const day = key.split(" ")[0]; // Extract the date part (YYYY-MM-DD)
        const isNewDay = currentDay !== day;
  
        if (isNewDay) {
          currentDay = day;
          color = colors[currentColorIndex++ % colors.length]; // Alternate colors
        }
  
        const barStartX =
          index === 0
            ? left // Start at the leftmost edge for the first index
            : xScale.getPixelForValue(index - 1) + (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) / 2;
  
        const barEndX =
          index < originalKeys.length - 1
            ? xScale.getPixelForValue(index) + (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) / 2
            : right; // For the last bar, fill to the right edge
  
        // Ensure valid bar positions
        if (!isNaN(barStartX) && !isNaN(barEndX)) {
          ctx.fillStyle = color;
          ctx.fillRect(barStartX, top, barEndX - barStartX, bottom - top);
        }
  
        // Write the date on the last bar of the day
        const nextDay = originalKeys[index + 1]?.split(" ")[0]; // Look ahead to the next day
        if (nextDay !== currentDay || index === originalKeys.length - 1) {
          const barCenterX = (barStartX + barEndX) / 2; // Center of the last bar for the day
          const textY = top + 40; // Position the text slightly above the bottom of the chart
  
          ctx.fillStyle = "black"; // Text color
          ctx.font = "24px Arial"; // Font style and size
          ctx.textAlign = "center"; // Center align the text
          ctx.textBaseline = "middle"; // Vertically center the text
  
          const dateLabel = day.split("-").join("-"); // Convert YYYY-MM-DD to MM-DD format
          if(customPeriod != "daily")
          ctx.fillText(dateLabel, barCenterX -100, textY);
        }
      });
  
      ctx.restore();
    },
  };
  
  // Register the plugin
  ChartJS.register(dayChangeBackgroundPlugin);
  
  

  

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
          left: 15, // Fixed width for the y-axis
      },
  },
    scales: {
      x: {
        title: {
          display: false,
        },
        ticks: {
          autoSkip: false,
          callback: function (value, index, ticks) {
            const labelIndex = value;
            const label = this.getLabels()[labelIndex];
  
            if (period !== 'daily') {
              return `${label.split(',')[1]}`;
              //return label;
            }
  
            return label;
          },
        },
        grid: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 0.25,
          callback: function (value) {
            return value.toFixed(2); // Adjust formatting if needed
        },
        font: {
            size: 12, // Control font size
        },
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
      customPeriod: period, // Pass the period dynamically
      originalKeys, // Pass the original keys for day detection
      //dayChangeBackgroundPlugin,
      tooltip: {
        enabled: true,
        callbacks: {
          title: () => '',
          label: function (context) {
            return [`Value: ${context.raw}`, context.label];
          },
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };
  
  
  
  

  return (
    <div className="flex flex-col items-center justify-center w-full">
      
    <div className="flex flex-row w-full ">
      <div ref={snapshotDivRef} className={` ${hideYAxis ? 'hidden' : ''}  h-[400px] w-[50px] bg-white`}></div>
      <div ref={chartContainerRef} className="overflow-x-auto w-full h-[400px]">
        {error ? (
          <div>Error loading data. Please try again later. {error}</div>
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
        <div className={`mt-4 text-xl ${period != "hourly" && 'hidden' }`}>Scroll to see other days</div>
    </div>
  );
};

export default RainfallChart;
