import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import api from '../utility/api';
import Toggle from './Toggle'; // Import the Toggle component
import { useSelector } from 'react-redux';

const ContactForm = ({ contactToEdit }) => {
  const [name, setName] = useState(contactToEdit?.name || '');
  const [email, setEmail] = useState(contactToEdit?.email || '');
  const [phone, setPhone] = useState(contactToEdit?.phone || '');
  const [isAlertSettingsExpanded, setIsAlertSettingsExpanded] = useState(false);
  const user = useSelector((state) => state.userInfo.user);
  const [alertSettings, setAlertSettings] = useState({
    'Daily Report': { email: true, sms: true },
    Forecast: { email: true, sms: true },
    'NOAA Atlas 14': { email: true, sms: true },
  });
  const [additionalSettings, setAdditionalSettings] = useState({
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

  const isEditMode = contactToEdit !== null;
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!contactToEdit) {
      alert('You can only delete an existing contact.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/api/contacts/${contactToEdit.id}`);
        navigate('/contact-list');
      } catch (error) {
        console.error('Error deleting contact:', error.message);
        alert('An error occurred while deleting the contact.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      email,
      phone,
      status: 'active',
      alert_settings: alertSettings,
      additional_settings: additionalSettings,
    };

    try {
      if (contactToEdit) {
        await api.patch(`/api/contacts/${contactToEdit.id}`, payload);
      } else {
        await api.post(`/api/contacts/`, payload);
      }
      navigate('/contact-list');
    } catch (error) {
      console.error('Error saving contact:', error.message);
    }
  };

  const toggleAlertSetting = (alertType, setting) => {
    setAlertSettings((prev) => ({
      ...prev,
      [alertType]: {
        ...prev[alertType],
        [setting]: !prev[alertType][setting],
      },
    }));
  };

  const toggleAdditionalSetting = (key) => {
    setAdditionalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAccountTier = (key) => {
    setAdditionalSettings((prev) => ({
      ...prev,
      accountTier: {
        ...prev.accountTier,
        [key]: !prev.accountTier[key],
      },
    }));
  };

  return (
    <div className={`relative ${user.tier >= 4 ? "mt-24" : "mt-8"} p-6 w-full max-w-lg mx-auto bg-white shadow-md rounded-lg`}>
      {/* Close Button */}
      <button
        onClick={() => navigate('/contact-list')}
        className="absolute top-4 right-4 bg-red-400 text-white rounded-full p-2 shadow-lg hover:bg-red-600"
      >
        <FaTimes />
      </button>

      <h1 className="text-2xl font-bold mb-4">{contactToEdit ? `Edit ${name}` : 'Add Contact'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div>
          <div className="flex justify-between">
            <label htmlFor="name" className="block text-gray-700 font-bold">
              Name
            </label>
            {contactToEdit && (
              <Link to="/assign-locations" className="text-sm">
                Assign Locations
              </Link>
            )}
          </div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 font-bold">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-gray-700 font-bold">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>

        {/* Additional Settings */}
        {user.tier >= 4 && 
        (
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Account Actions</h2>
          <div className="flex items-center mb-2">
            <Toggle
              checked={additionalSettings.turnAccountOn}
              onChange={() => toggleAdditionalSetting('turnAccountOn')}
            />
            <span className="ml-2">Turn Account On</span>
          </div>
          <div className="flex items-center mb-2">
            <Toggle
              checked={additionalSettings.suspendAccount}
              onChange={() => toggleAdditionalSetting('suspendAccount')}
            />
            <span className="ml-2">Suspend Account</span>
          </div>
          <div className="flex items-center mb-2">
            <Toggle
              checked={additionalSettings.convertToDemo}
              onChange={() => toggleAdditionalSetting('convertToDemo')}
            />
            <span className="ml-2">Convert To Demo Account</span>
          </div>
          <div className="flex items-center mb-2">
            <Toggle
              checked={additionalSettings.convertToPaid}
              onChange={() => toggleAdditionalSetting('convertToPaid')}
            />
            <span className="ml-2">Convert To Paid Account</span>
          </div>
          <div className="flex items-center mb-2">
            <Toggle
              checked={additionalSettings.sendMarketingTexts}
              onChange={() => toggleAdditionalSetting('sendMarketingTexts')}
            />
            <span className="ml-2">Send Marketing Texts</span>
          </div>
          <div className="flex items-center mb-2">
            <Toggle
              checked={additionalSettings.enableGroupReportService}
              onChange={() => toggleAdditionalSetting('enableGroupReportService')}
            />
            <span className="ml-2">Enable Group Report Service</span>
          </div>
          <div className="flex items-center">
            <Toggle
              checked={additionalSettings.enable15MinReports}
              onChange={() => toggleAdditionalSetting('enable15MinReports')}
            />
            <span className="ml-2">Enable 15 Minute Data Reports</span>
          </div>
        </div>)}

        {/* Upgrade/Downgrade Account Tier */}
       { user.tier >= 4 && ( <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Upgrade/Downgrade Account Tier</h2>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="bronze"
              checked={additionalSettings.accountTier.bronze}
              onChange={() => toggleAccountTier('bronze')}
              className="mr-2"
            />
            <label htmlFor="bronze" className="ml-2">
              Bronze
            </label>
          </div>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="silver"
              checked={additionalSettings.accountTier.silver}
              onChange={() => toggleAccountTier('silver')}
              className="mr-2"
            />
            <label htmlFor="silver" className="ml-2">
              Silver
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="gold"
              checked={additionalSettings.accountTier.gold}
              onChange={() => toggleAccountTier('gold')}
              className="mr-2"
            />
            <label htmlFor="gold" className="ml-2">
              Gold
            </label>
          </div>
        </div>)}

        {/* Alert Settings */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setIsAlertSettingsExpanded((prev) => !prev)}
            className="bg-[#128CA6] text-white px-4 py-2 rounded hover:bg-green-500 w-full text-left"
          >
            {isAlertSettingsExpanded ? 'Hide Alert Settings' : 'Show Alert Settings'}
          </button>

          {isAlertSettingsExpanded && (
            <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
              {Object.keys(alertSettings).map((alertType) => (
                <div key={alertType} className="flex flex-col">
                  <span className="font-bold text-gray-700">{alertType}</span>
                  <div className="flex items-center mt-2">
                    <span className="mr-2">Email</span>
                    <Toggle
                      checked={alertSettings[alertType].email}
                      onChange={() => toggleAlertSetting(alertType, 'email')}
                    />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="mr-2">SMS</span>
                    <Toggle
                      checked={alertSettings[alertType].sms}
                      onChange={() => toggleAlertSetting(alertType, 'sms')}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {isEditMode ? 'Update Contact' : 'Create Contact'}
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              Delete Contact
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
