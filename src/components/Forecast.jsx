import React, { useEffect, useRef, useState } from 'react';
import Datatable from './Datatable';
import moment from 'moment';
import api from '../utility/api'; // Import the api utility
import { useSelector } from 'react-redux';

export default function Forecast({ location, className }) {
  const [forecast, setForecast] = useState([]);
  const [localForecastData, setLocalForecastData] = useState([]);
  const [headers, setHeaders] = useState([
    moment().format('ddd'),
    moment().add(1, 'days').format('ddd'),
    moment().add(2, 'days').format('ddd'),
  ]);

  const imageRef = useRef(null);
  const user = useSelector((state) => state.userInfo.user);

  const handleFullScreen = () => {
    const element = imageRef.current;

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else {
      let test = imageRef.current;
      test.classList.contains('ios-fullscreen')
        ? imageRef.current.classList.remove('ios-fullscreen')
        : imageRef.current.classList.add('ios-fullscreen');
    }
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    if (imageRef.current) {
      imageRef.current.classList.remove('ios-fullscreen');
    }
  };

  useEffect(() => {
    if (!location) {
      setForecast([
        'https://www.wpc.ncep.noaa.gov/qpf/fill_94qwbg.gif',
        'https://www.wpc.ncep.noaa.gov/qpf/fill_98qwbg.gif',
        'https://www.wpc.ncep.noaa.gov/qpf/fill_99qwbg.gif',
      ]);
    } else {
      if (location.id) {
        api
          .get(`/api/locations/${location.id}/forecast`, {
            params: { client_id: user.clients[0].id },
          })
          .then(({ data }) => {
            if (data.forecasts) {
              setLocalForecastData(data.forecasts);
            } else {
              console.log('No forecast data received.');
            }
          })
          .catch((error) => {
            console.error('Error fetching forecast data:', error);
          });
      }
    }
  }, [location, user.clients]);

  return !location ? (
    <div className={`px-6 min-h-[10rem] mb-4 flex justify-start gap-2 overflow-scroll ${className}`}>
      {forecast.map((m, i) => (
        <div key={i} className="min-w-[fit-content] h-full relative overflow-hidden">
          <img
            ref={imageRef}
            src={m}
            alt={`${headers[i]}`}
            title={headers[i]}
            onClick={handleFullScreen}
            onDoubleClick={exitFullScreen}
            className="md:my-2"
          />
          <div className="bg-[black] p-2 text-[white] font-bold flex justify-center items-center right-[0rem] md:right-[0rem] w-[10%] md:w-[20%] md:top-[.5rem] center text-sm md:text-2xl z-index-5 top-0 absolute">
            {headers[i]}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="flex md:flex-row flex-row h-full min-h-[10rem] w-full flex-1 gap md:p-2 border justify-center items-center text-[--text-color]">
      {headers.map((d, i) => (
        <div key={i} className="flex flex-col flex-1 w-full">
          <div className="text-md font-bold text-center md:text-2xl p-4 bg-[#128CA6]">{d}</div>
          <div className="text-md font-bold md:text-2xl text-center p-4">{localForecastData[i]?.value}</div>
        </div>
      ))}
    </div>
  );
}
