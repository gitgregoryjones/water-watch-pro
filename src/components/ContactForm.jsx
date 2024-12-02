import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import api from '../utility/api';

const ContactForm = ({ contactToEdit }) => {
  const [name, setName] = useState(contactToEdit?.name || '');
  const [email, setEmail] = useState(contactToEdit?.email || '');
  const [phone, setPhone] = useState(contactToEdit?.phone || '');
  const [emailNotification, setEmailNotification] = useState(contactToEdit?.email_notification || false);
  const [smsNotification, setSmsNotification] = useState(contactToEdit?.sms_notification || false);
  const [isAlertSettingsExpanded, setIsAlertSettingsExpanded] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    'Daily Report': { email: true, sms: true },
    Forecast: { email: true, sms: true },
    'NOAA Atlas 14': { email: true, sms: true }
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
        alert('Contact deleted successfully!');
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
      email_notification: emailNotification,
      sms_notification: smsNotification,
      alert_settings: alertSettings,
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

  return (
    <div className="relative mt-8 p-6 w-full max-w-lg mx-auto bg-white shadow-md rounded-lg">
      {/* Close Button */}
      <button
        onClick={() => navigate('/contact-list')}
        className="absolute top-4 right-4 bg-red-400 text-white rounded-full p-2 shadow-lg hover:bg-red-600"
      >
        <FaTimes />
      </button>

      <h1 className="text-2xl font-bold mb-4">{contactToEdit ? `Edit ${name}` : 'Add Contact'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>
        <div className='hidden'>
          <label className="block text-gray-700 font-bold">
            <input
              type="checkbox"
              checked={emailNotification}
              onChange={(e) => setEmailNotification(e.target.checked)}
              className="mr-2"
            />
            Email Notifications
          </label>
        </div>
        <div className='hidden'>
          <label className="block text-gray-700 font-bold">
            <input
              type="checkbox"
              checked={smsNotification}
              onChange={(e) => setSmsNotification(e.target.checked)}
              className="mr-2"
            />
            SMS Notifications
          </label>
        </div>

        {/* Expandable Alert Settings */}
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
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={alertSettings[alertType].email}
                      onChange={() => toggleAlertSetting(alertType, 'email')}
                      className="mr-2"
                    />
                    Email
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={alertSettings[alertType].sms}
                      onChange={() => toggleAlertSetting(alertType, 'sms')}
                      className="mr-2"
                    />
                    SMS
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

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
