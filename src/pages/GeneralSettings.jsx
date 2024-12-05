import React, { useState } from 'react';
import SubHeader from '../components/Subheader';

const GeneralSettingsPage = () => {
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
    thresholdAlerts : {
      enabled:true,
      'rapidRain':false,
      '24Hour':true
    }
  });

  const handleToggle = (section, key) => {
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
    <div className='h-full w-full md:w-[80%]  flex flex-col mt-28 '>
    <SubHeader/>
<div className="mt-14 p-6 w-full md:w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg">
        
    <div className={`p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center`}><i className='fa fa-gear'></i>General Notification Settings</div>
      
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Daily Report Section */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Daily Report</h2>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.dailyReport.enabled}
              onChange={() => handleToggle('dailyReport', 'enabled')}
              className="mr-2"
            />
            Enabled
          </label>
        </div>

        {/* Forecast Section */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Forecast</h2>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={settings.forecast.enabled}
              onChange={() => handleToggle('forecast', 'enabled')}
              className="mr-2"
            />
            Enabled
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.forecast.combineLocations}
              onChange={() => handleToggle('forecast', 'combineLocations')}
              className="mr-2"
            />
            Combine Locations
          </label>
        </div>

        {/* NOAA Atlas 14 Section */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-2">NOAA Atlas 14</h2>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={settings.noaaAtlas14.enabled}
              onChange={() => handleToggle('noaaAtlas14', 'enabled')}
              className="mr-2"
            />
            Enabled
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={settings.noaaAtlas14['24Hour']}
              onChange={() => handleToggle('noaaAtlas14', '24Hour')}
              className="mr-2"
            />
            24 Hour
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={settings.noaaAtlas14['1Hour']}
              onChange={() => handleToggle('noaaAtlas14', '1Hour')}
              className="mr-2"
            />
            1 Hour
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.noaaAtlas14.first}
              onChange={() => handleToggle('noaaAtlas14', 'first')}
              className="mr-2"
            />
            First
          </label>
        </div>
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Other Alerts</h2>
         
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={settings.thresholdAlerts['rapidRain']}
              onChange={() => handleToggle('thresholdAlerts', 'rapidRain')}
              className="mr-2"
            />
            RapidRain 15 Minute
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={settings.thresholdAlerts['24Hour']}
              onChange={() => handleToggle('thresholdAlerts', '24Hour')}
              className="mr-2"
            />
            24 Hour Threshold Exceeded
          </label>
         
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
    </div>
  );
};

export default GeneralSettingsPage;
