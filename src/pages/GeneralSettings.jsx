import React, { useState } from 'react';
import SubHeader from '../components/Subheader';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Toggle from '../components/Toggle';
import { useSelector } from 'react-redux';
import Upgrade from '../components/Upgrade';


const GeneralSettingsPage = () => {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const user = useSelector((state) => state.userInfo.user);
  const [settings, setSettings] = useState({
    dailyReport: {
      enabled: true,
    },
    forecast: {
      enabled: true,
      combineLocations: false,
    },
    noaaAtlas14: {
      enabled: true,
      '24Hour': false,
      '1Hour': false,
      first: false,
    },
    thresholdAlerts: {
      enabled: true,
      rapidRain: false,
    },
    Exceeded24HourThreshold: {
      enabled: true,
      combineLocations: false,
    },
  });

  const handleToggle = (section, key) => {
    if (key === 'rapidRain' && user.tier < 2) {
      setShowUpgrade(true);
      setSettings((prevSettings) => ({
        ...prevSettings,
        [section]: {
          ...prevSettings[section],
          [key]: false,
        },
      }));
      return;
    }
    setSettings((prevSettings) => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [key]: !prevSettings[section][key],
      },
    }));
  };

  const handleSubmit = () => {
    console.log('Updated Settings:', settings);
    alert('Settings updated successfully!');
  };

  return (
    <div className="h-full w-full flex flex-col mt-28">
      <h1 className="text-2xl font-bold text-green-800 m-8 self-start">
        Settings &gt; Preferences
      </h1>
      <Card
        header={
          <div className="flex justify-start rounded space-x-6 mb-8 self-start bg-[transparent] w-full p-2">
            <Link
              to="/contact-list"
              className="text-blue-500 hover:text-blue-700 font-bold border-b-2 border-transparent hover:border-blue-700"
            >
              Modify Contacts
            </Link>

            <Link
              to="/location-list"
              className="text-blue-500 hover:text-blue-700 font-bold border-b-2 border-transparent hover:border-blue-700"
            >
              Modify Locations
            </Link>
            <span className="text-gray-800 font-bold border-b-2 border-blue-500">
              Notifications
            </span>
            <Upgrade showMsg={false} tier={4}>
            <Link
              to="/settings-admin"
              className="text-blue-500 hover:text-blue-700 font-bold border-b-2 border-transparent hover:border-blue-700"
            >
              Client Management
            </Link>
            </Upgrade>
          </div>
        }
        className={'border-[whitesmoke] bg-[whitesmoke] md:rounded-[unset]'}
      >
        <div className="p-6 w-full md:w-full mx-auto bg-white shadow-md rounded-lg">
          <div
            className={`p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center`}
          >
            <i className="fa fa-gear"></i>General Notification Settings
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Daily Report Section */}
            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-2">Daily Report</h2>
              <div className="flex items-center">
                <Toggle
                  checked={settings.dailyReport.enabled}
                  onChange={() => handleToggle('dailyReport', 'enabled')}
                />
                <span className="ml-2">Enabled</span>
              </div>
            </div>

            {/* 24 Hour Threshold Section */}
            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-2">24 Hour Threshold Exceeded</h2>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.Exceeded24HourThreshold.enabled}
                  onChange={() => handleToggle('Exceeded24HourThreshold', 'enabled')}
                />
                <span className="ml-2">Enabled</span>
              </div>
              <div className="flex items-center">
                <Toggle
                  checked={settings.Exceeded24HourThreshold.combineLocations}
                  onChange={() => handleToggle('Exceeded24HourThreshold', 'combineLocations')}
                />
                <span className="ml-2">Combine Locations</span>
              </div>
            </div>

            {/* Forecast Section */}
            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-2">Forecast</h2>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.forecast.enabled}
                  onChange={() => handleToggle('forecast', 'enabled')}
                />
                <span className="ml-2">Enabled</span>
              </div>
              <div className="flex items-center">
                <Toggle
                  checked={settings.forecast.combineLocations}
                  onChange={() => handleToggle('forecast', 'combineLocations')}
                />
                <span className="ml-2">Combine Locations</span>
              </div>
            </div>

            {/* NOAA Atlas 14 Section */}
            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-2">NOAA Atlas 14</h2>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.noaaAtlas14.enabled}
                  onChange={() => handleToggle('noaaAtlas14', 'enabled')}
                />
                <span className="ml-2">Enabled</span>
              </div>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.noaaAtlas14['24Hour']}
                  onChange={() => handleToggle('noaaAtlas14', '24Hour')}
                />
                <span className="ml-2">24 Hour</span>
              </div>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.noaaAtlas14['1Hour']}
                  onChange={() => handleToggle('noaaAtlas14', '1Hour')}
                />
                <span className="ml-2">1 Hour</span>
              </div>
              <div className="flex items-center">
                <Toggle
                  checked={settings.noaaAtlas14.first}
                  onChange={() => handleToggle('noaaAtlas14', 'first')}
                />
                <span className="ml-2">First</span>
              </div>
            </div>

            {/* Other Alerts */}
            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-2">Other Alerts</h2>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.thresholdAlerts.rapidRain}
                  onChange={() => handleToggle('thresholdAlerts', 'rapidRain')}
                />
                <span className="ml-2">RapidRain 15 Minute</span>
              </div>
              {showUpgrade && (
                <div className="flex flex-col justify-center items-center gap-2 m-2 p-4 w-[20rem] border-[gold] bg-[white] border-4 rounded">
                  <div>Go For The Gold!</div>
                  <a href="https://waterwatchpro.com/prices">Click Here to Upgrade</a>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default GeneralSettingsPage;
