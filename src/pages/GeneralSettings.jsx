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
    <div className="p-6 w-full md:w-1/2 mx-auto bg-white shadow-md rounded-lg mt-28">
        <SubHeader/>
      <h1 className="text-2xl font-bold mb-6 text-center">General Notification Settings</h1>
      <div className='w-full rounded bg-yellow-200 h-12 flex justify-center items-center m-2'>These settings override all user settings</div>
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
  );
};

export default GeneralSettingsPage;
