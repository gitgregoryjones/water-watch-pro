import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import api from '../utility/api';
import Toggle from './Toggle'; // Import the Toggle component
import { useSelector } from 'react-redux';
import WorkingDialog from './WorkingDialog';

const ContactForm = ({ contactToEdit }) => {
  const [name, setName] = useState(contactToEdit?.name || '');
  const [email, setEmail] = useState(contactToEdit?.email || '');
  const [phone, setPhone] = useState(contactToEdit?.phone || '');
  const [client_id, setClient_Id] = useState(contactToEdit?.client_id)
  const [accountName, setAccountName] = useState(contactToEdit?.account_name)
  const [daily_report_on, set] = useState(contactToEdit?.account_name)

  const [formData, setFormData] = useState({
      daily_report_on: contactToEdit?.daily_report_on,
      daily_report_on_sms: contactToEdit?.daily_report_on_sms,
      forecast_on: contactToEdit?.forecast_on,
      forecast_on_sms: contactToEdit?.forecast_on_sms,
      atlas14_24h_on: contactToEdit?.atlas14_24h_on,
      atlas14_24h_on_sms: contactToEdit?.atlas14_24h_on_sms,
      //atlas14_1h_on: contactToEdit?.atlas14_1h_on,
      //atlas14_1h_on_sms: contactToEdit?.atlas14_1h_on_sms,
      //atlas14_first_on: contactToEdit?.atlas14_first_on,
      //atlas14_first_on_sms: contactToEdit?.atlas14_1h_on_sms,
      exceed24h_on: contactToEdit?.exceed24h_on,
      exceed24h_on_sms: contactToEdit?.exceed24h_on_sms,
      //exceed24h_combine_locations: contactToEdit?.exceed24h_combine_locations
  });

  

  const [isAlertSettingsExpanded, setIsAlertSettingsExpanded] = useState(false);
  const user = useSelector((state) => state.userInfo.user);
  const [showDialog, setShowDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState([])


  const handleChange = (e) => {
    const { name, value, type, checked } = e;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const fetchClients = async (page) => {

    if(user.role != "admin")
      return;

    try {
      const response = await api.get(`/api/clients/?client_id=${user.clients[0].id}&page=${page}&page_size=250`);
      setClients(response.data);
      /*let me = response.data.find((c)=> c.id == user.clients[0]?.id)
     
      if(me){
        setAccountName(me.account_name);
      }*/
      // Update total pages if API provides pagination metadata
      // setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching clients:', error.message);
    }
  };

  useEffect(() => {
   fetchClients(currentPage)
   
  }, [currentPage])
  

  const [alertSettings, setAlertSettings] = useState({
    'Daily Report': { email: true, sms: true },
    Forecast: { email: true, sms: true },
    'NOAA Atlas 14': { email: true, sms: true },
    '24 Hour Threshold': { email: true, sms: true },
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
        setTimeout(() => {
          setShowDialog(false);
          navigate('/contact-list');
        }, 2000);
      } catch (error) {
        console.error('Error deleting contact:', error.message);
        alert('An error occurred while deleting the contact.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowDialog(true);

    

    const payload = {
      name,
      email,
      phone,
      status: 'active',
      daily_report_on:formData.daily_report_on,
      daily_report_on_sms: formData.daily_report_on_sms,
      forecast_on: formData.forecast_on,
      forecast_on_sms:formData.forecast_on_sms,
      atlas14_24h_on: formData.atlas14_24h_on,
      atlas14_24h_on_sms: formData.atlas14_24h_on_sms,
      atlas14_1h_on: formData.atlas14_1h_on,
      atlas14_1h_on_sms: formData.atlas14_1h_on_sms,
      atlas14_first_on : formData.atlas14_first_on,
      atlas14_first_on_sms: formData.atlas14_first_on_sms,
      exceed24h_on : formData.exceed24h_on,
      exceed24h_on_sms: formData.exceed24h_on_sms,
    };

    try {
      if (contactToEdit) {
        await api.patch(`/api/contacts/${contactToEdit.id}/?client_id=${user.clients[0]?.id}`, payload);
      } else {
        await api.post(`/api/contacts/?client_id=${user.clients[0]?.id}`, payload);
      }

      setTimeout(() => {
        setShowDialog(false);
        navigate('/contact-list');
      }, 2000);
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


  const renderSettings = (settings) => {
    // Group the keys into pairs (email + SMS)
    const groupedKeys = Object.keys(settings).reduce((acc, key) => {
      const baseKey = key.replace('_sms', '');
      if (!acc[baseKey]) acc[baseKey] = {};
      if (key.endsWith('_sms')) {
        acc[baseKey].sms = key;
      } else {
        acc[baseKey].email = key;
      }
      return acc;
    }, {});
  
    return Object.entries(groupedKeys).map(([header, { email, sms }]) => {
      const label = header.replace(/_/g, ' '); // Create a readable header
  
      return (
        <div className="flex flex-col mb-4" key={header}>
          <span className="font-bold text-gray-700 capitalize">{label.trim().replace("on","").replace("atlas14 24h","NOAA Atlas 14").replace("exceed24h","24 Hour Threshold")}</span>
  
          <div className="flex items-center mt-2">
            <span className="mr-2">Email</span>
            <Toggle
              checked={settings[email]}
              onChange={() => handleChange({ name: email, value: !settings[email] })}
            />
          </div>
  
          <div className="flex items-center mt-2">
            <span className="mr-2">SMS</span>
            <Toggle
              checked={settings[sms]}
              onChange={() => handleChange({ name: sms, value: !settings[sms] })}
            />
          </div>
        </div>
      );
    });
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
      <h2 style={{visibility:"hidden"}}>{user.clients[0]?.id}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div>
          <div className="flex justify-between">
            <label htmlFor="name" className="block text-gray-700 font-bold">
              Name
            </label>
            {contactToEdit && user.role != "admin" && (
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
       { user.role == "admin" && (<div>
          <label htmlFor="accountName" className="block text-gray-700 font-bold">
            Account Name
          </label>
          <input type="text" name="account_name" id="account_name" value={accountName} readOnly/>
          {/*
          <select
            
           
            id="client_id"
            value={client_id}
            onChange={(e) => setClient_id(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          >
            {clients.map((c,i)=>{
              return <option value={c.id}>{c.account_name}</option>
            })}
            </select>
            */}
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
             
               {renderSettings(formData)}         
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
      <WorkingDialog showDialog={showDialog} />
    </div>
  );
};

export default ContactForm;
