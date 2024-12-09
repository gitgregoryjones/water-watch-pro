import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Toggle from '../components/Toggle';
import { useSelector } from 'react-redux';

const UserAccountProvisioning = () => {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const user = useSelector((state) => state.userInfo.user);
  const [settings, setSettings] = useState({
    turnAccountOn: false,
    suspendAccount: false,
    convertToDemo: false,
    convertToPaid: false,
    sendMarketingTexts: false,
    enableGroupReportService: false,
    enable15MinReports: false,
    accountTier: {
      bronze: false,
      silver: false,
      gold: false,
    },
  });

  const handleToggle = (key) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: !prevSettings[key],
    }));
  };

  const handleCheckboxGroupChange = (key) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      accountTier: {
        ...prevSettings.accountTier,
        [key]: !prevSettings.accountTier[key],
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
        Settings &gt; Accounts Management
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
            <Link
              to="/settings-general"
              className="text-blue-500 hover:text-blue-700 font-bold border-b-2 border-transparent hover:border-blue-700"
            >
              Notifications
            </Link>
            <span className="text-gray-800 font-bold border-b-2 border-blue-500">
              User Account Management
            </span>
          </div>
        }
        className={'border-[whitesmoke] bg-[whitesmoke] md:rounded-[unset]'}
      >
        <div className="p-6 w-full md:w-full mx-auto bg-white shadow-md rounded-lg">
          <div
            className={`p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center`}
          >
            <i className="fa fa-gear"></i>User Account Management
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Toggles */}
            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-4">Account Actions</h2>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.turnAccountOn}
                  onChange={() => handleToggle('turnAccountOn')}
                />
                <span className="ml-2">Turn Account On</span>
              </div>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.suspendAccount}
                  onChange={() => handleToggle('suspendAccount')}
                />
                <span className="ml-2">Suspend Account</span>
              </div>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.convertToDemo}
                  onChange={() => handleToggle('convertToDemo')}
                />
                <span className="ml-2">Convert To Demo Account</span>
              </div>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.convertToPaid}
                  onChange={() => handleToggle('convertToPaid')}
                />
                <span className="ml-2">Convert To Paid Account</span>
              </div>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.sendMarketingTexts}
                  onChange={() => handleToggle('sendMarketingTexts')}
                />
                <span className="ml-2">Send Marketing Texts</span>
              </div>
              <div className="flex items-center mb-2">
                <Toggle
                  checked={settings.enableGroupReportService}
                  onChange={() => handleToggle('enableGroupReportService')}
                />
                <span className="ml-2">Enable Group Report Service</span>
              </div>
              <div className="flex items-center">
                <Toggle
                  checked={settings.enable15MinReports}
                  onChange={() => handleToggle('enable15MinReports')}
                />
                <span className="ml-2">Enable 15 Minute Data Reports</span>
              </div>
            </div>

            {/* Upgrade/Downgrade Account Tier */}
            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-4">Upgrade/Downgrade Account Tier</h2>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="bronze"
                  checked={settings.accountTier.bronze}
                  onChange={() => handleCheckboxGroupChange('bronze')}
                  className="mr-2"
                  name="tier"
                />
                <label htmlFor="bronze" className="ml-2">
                  Bronze
                </label>
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="silver"
                  name="tier"
                  checked={settings.accountTier.silver}
                  onChange={() => handleCheckboxGroupChange('silver')}
                  className="mr-2"
                />
                <label htmlFor="silver" className="ml-2">
                  Silver
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="gold"
                  checked={settings.accountTier.gold}
                  onChange={() => handleCheckboxGroupChange('gold')}
                  className="mr-2"
                  name="tier"
                />
                <label htmlFor="gold" className="ml-2">
                  Gold
                </label>
              </div>
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

export default UserAccountProvisioning;
