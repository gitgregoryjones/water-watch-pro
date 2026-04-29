import React, { useEffect, useState, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "../utility/api";
import { convertTier } from "../utility/loginUser";
import RainfallTable from "./RainfallTable";
import { ThemeContext } from "../utility/ThemeContext";
import { trackAnalyticsEvent } from "../utility/analytics";



const RainfallChart = ({ location, period, max = 72, tableOnly= false }) => {
  const user = useSelector((state) => state.userInfo.user);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const chartContainerRef = useRef(null);
  const [rawData, setRawData] = useState([]);

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = (today.getDate() ).toString().padStart(2, "0");
  const tomorrowDate = `${year}-${month}-${day}`;

  const [speriod,setSperiod] = useState(period)

  const [originalKeys, setOriginalKeys] = useState([]);


  const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
  

  

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
    console.log(`Returning date ${month} ${day}, ${hour.replace(" ","").substring(0,hour.length-2)}`)
    // Construct the desired format
    return `${month} ${day}, ${hour.replace(" ","").substring(0,hour.length-2)}`;
    //return `${month} ${day}, ${hour}`;
  };

  
  

  const describeDateRange = () => {
    if (period === "daily") {
      return `24hr tab clicked ${getBeginEndRange()}`
    }
    if (period === "rapidrain") {
      return `rapidrain tab clicked ${getBeginEndRange()}`;
    }
    return `hourly tab clicked ${getBeginEndRange()}`;
  };

  const fetchChartData = async () => {
    if (!location.id) return;

    
  
    let endpoint;
  
    // Determine the appropriate endpoint based on the `period`
    if (period === "rapidrain") {
      endpoint = `/api/locations/${location.id}/15m_data?hours=${max}&${user.clients?.length > 1 ? `client_id=${user.clients[0].id}`:`` }`;
    } else if (period === "daily") {
      endpoint = `/api/locations/${location.id}/24h_data/${getBeginEndRange()}?${user.clients?.length > 1 ? `client_id=${user.clients[0].id}`:`` }`;
    } else {
      endpoint = `/api/locations/${location.id}/hourly_data?days=${max}&date=${tomorrowDate}&${user.clients?.length > 1 ? `client_id=${user.clients[0].id}`:`` }`;
    }
  
    try {
      const response = await api.get(endpoint);
      const labels = [];
      const values = [];
      const backgroundColors = [];
      const keys = []; 
  
      const data = response.data;

      const lastMeasureR = await api.get(`/api/services/process_status`);

      const measure =  lastMeasureR.data.datetime; /* Feedback from Gene, he wants to see the current hour all the time to match the emails showing current hour,subtractOneHour(lastMeasureR.data.datetime)*/

      setRawData(data);

      
  
      if (period !== "daily") {

        console.log(`THE MEASURE IS ${measure}`)

        let entries = Object.entries(data.hourly_data).reverse();

        console.log(`Entries count is ${entries.length}`)
        

        entries = [...entries.filter(([key,value])=>{console.log(`Geg comparing ${key} to ${measure} and is ${new Date(key) <= new Date(measure)}`); return new Date(key) <= new Date(measure)})]
        
        console.log(`Entries count AFTER is ${entries.length}`)


  
        entries.forEach(([key, value],i) => {

          console.log(`Looping ${i} and key is ${key}`)
          
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
          backgroundColors.push(value.total >= location.h24_threshold ? location.atlas14_threshold && value.total >= location.atlas14_threshold["1h"][0] &&  convertTier(user)  != 1 ? "red" : "orange" : "green");
        });
      } else {
        data.total_rainfall.forEach((day) => {
          keys.push(day.date);
          labels.push(day.date);
          values.push(day.rainfall);
          backgroundColors.push(day.rainfall >= location.h24_threshold ? location.atlas14_threshold && day.rainfall >= location.atlas14_threshold["24h"][0] && convertTier(user)  != 1 ? "red" : "orange" : "green");
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
      trackAnalyticsEvent('rainfall_report_view', {
        site_id: String(location.id),
        date_range: describeDateRange(),
      });
    } catch (err) {
      alert(`Error fetching rainfall data: ${err.message}`);
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

  useEffect(() => {
    fetchChartData();
  }, [ location.id,period], tableOnly);

  

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
  
  

  

  const maxYValue = chartData ? Math.max(...chartData.datasets[0].data, 0.5) : 0.5;
  const yAxisMax = Math.ceil(maxYValue / 0.25) * 0.25;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
          left: 0
      },
  },
    scales: {
      x: {
        offset: false,
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
           color: isDark &&'white'
        },
        grid: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        max: yAxisMax,
        ticks: {
          display: false,
        },
        grid: {
          display: true,
          drawTicks: false,
        },
        border: {
          display: false,
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
  
  
  //alert(`tableOnly is ${tableOnly} and period is ${period}`)
  

  return (
    <div className="flex flex-col items-center justify-center w-full">
      
    {(tableOnly && period === "hourly" ||  tableOnly && period === "rapidrain") &&
   <RainfallTable data={location} period={period}/>
    
    
    
    || <div className="flex flex-row w-full">
      <div className="sticky left-0 z-20 h-[400px] w-[84px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        {chartData && (
          <Bar
            data={{ labels: [""], datasets: [{ data: [0], backgroundColor: "transparent", borderWidth: 0 }] }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              layout: {
                padding: { left: 10, right: 4 },
              },
              scales: {
                x: { display: false, grid: { display: false } },
                y: {
                  beginAtZero: true,
                  max: yAxisMax,
                  ticks: {
                    stepSize: 0.25,
                    callback: (value) => Number(value).toFixed(2),
                    color: isDark && "white",
                    padding: 4,
                  },
                  grid: { display: false },
                },
              },
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
            }}
          />
        )}
      </div>
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
      
    </div>}
        <div className={`mt-4 text-xl ${period != "hourly" && 'hidden' }`}>Scroll to see other days</div>
    </div>
  );
};

export default RainfallChart;
