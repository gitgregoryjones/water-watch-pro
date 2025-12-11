import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import api from '../utility/api';
import WorkingDialog from './WorkingDialog';
import Card from './Card';
import SettingsMenu from './SettingsMenu';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../utility/UserSlice';
import Toggle from './Toggle';
import { convertTier } from '../utility/loginUser';

const UserForm = ({ clientToEdit, myself }) => {

  const user = useSelector((state) => state.userInfo.user);

  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [showDialog, setShowDialog] = useState(false);
  const [msg, setMsg] = useState('');

  const [contactSettings, setContactSettings] = useState({
    daily_report_on: user?.daily_report_on ?? true,
    daily_report_on_sms: user?.daily_report_on_sms ?? true,
    exceed24h_on: user?.exceed24h_on ?? true,
    exceed24h_on_sms: user?.exceed24h_on_sms ?? true,
    forecast_on: user?.forecast_on ?? true,
    forecast_on_sms: user?.forecast_on_sms ?? true,
    atlas14_24h_on: user?.atlas14_24h_on ?? true,
    atlas14_24h_on_sms: user?.atlas14_24h_on_sms ?? true,
    rapidrain_on: user?.rapidrain_on ?? true,
    rapidrain_on_sms: user?.rapidrain_on_sms ?? true,
  });

  const clientId = user?.clients?.[0]?.id;
  const contactId = user?.contact_id || user?.id;


  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchContactSettings = async () => {
      if (!clientId || !contactId) return;
      try {
        const contactResponse = await api.get(`/api/contacts/${contactId}?client_id=${clientId}`);
        const c = contactResponse.data;
        setContactSettings({
          daily_report_on: c.daily_report_on ?? true,
          daily_report_on_sms: c.daily_report_on_sms ?? true,
          exceed24h_on: c.exceed24h_on ?? true,
          exceed24h_on_sms: c.exceed24h_on_sms ?? true,
          forecast_on: c.forecast_on ?? true,
          forecast_on_sms: c.forecast_on_sms ?? true,
          atlas14_24h_on: c.atlas14_24h_on ?? true,
          atlas14_24h_on_sms: c.atlas14_24h_on_sms ?? true,
          rapidrain_on: c.rapidrain_on ?? true,
          rapidrain_on_sms: c.rapidrain_on_sms ?? true,
        });
      } catch (error) {
        console.error('Error loading contact settings:', error.message);
      }
    };

    fetchContactSettings();
  }, [clientId, contactId]);

  const handleNotificationToggle = (key) => {
    setContactSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowDialog(true);

    const payload = { first_name: firstName, last_name: lastName, email, phone };

    try {
     


        let patchUser = await api.patch(`/users/me/`, payload);

        let updatedUser = await api.get(`/users/me/`);

        //alert(user.first_name)

        let copy = {...user}

        //alert(`Copy of user is ${copy.first_name} and return from backend is ${updatedUser.data.first_name}`)


        dispatch(updateUser(updatedUser.data));

        if (clientId && contactId) {
          await api.patch(`/api/contacts/${contactId}/?client_id=${clientId}`, {
            name: `${firstName} ${lastName}`.trim(),
            phone,
            email: email || null,
            ...contactSettings,
          });
        }

      setTimeout(() => {
        setShowDialog(false);
        setMsg(<span className="text-green-600">Successfully Updated</span>);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 800);
    } catch (e) {
      console.log(`Error: ${e.message}`);
      setShowDialog(false);
      setMsg(<span className="text-red-600">{e.message}</span>);
    }
  };

  return (
    <div className=" h-full w-full flex flex-col items-center  mt-18 text-gray-900">
      <h1 className="text-2xl font-bold text-green-800 dark:text-green-200 m-8 self-start">
        User Profile &gt;{firstName} {lastName}
      </h1>

      <Card
        
        className=" mx-auto    shadow-md  rounded-lg"
      >
        <div className=" w-full md:w-full mx-auto  rounded-lg">
          <div className="relative mt-0 w-full mx-auto rounded-lg">
            

            <h1 className="text-2xl font-bold mb-4">Edit User {firstName}</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div id="msg">{msg}</div>

              {/* First Name */}
              <div className="flex flex-col gap-4 shadow rounded  p-4">
                <div>
                  <label htmlFor="firstName" className="block py-2  font-bold">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border border-gray-300  rounded p-2 w-full"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block py-2  font-bold">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                                        className="border border-gray-300 rounded p-2 w-full"

                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block py-2 font-bold">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300  rounded p-2 w-full"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block py-2 font-bold">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-gray-300  rounded p-2 w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col shadow rounded  p-4 gap-4">
                <h2 className="text-xl font-bold">Notification Settings</h2>

                <div className="grid grid-cols-2 gap-4 border-t pt-4 dark:border-slate-700">
                  <div>
                    <span className="font-bold">Daily Report</span>
                    <div className="flex items-center mt-2 gap-2">
                      <span>Email</span>
                      <Toggle
                        checked={contactSettings.daily_report_on}
                        onChange={() => handleNotificationToggle('daily_report_on')}
                      />
                    </div>
                    <div className="flex items-center mt-2 gap-2">
                      <span>Text</span>
                      <Toggle
                        checked={contactSettings.daily_report_on_sms}
                        onChange={() => handleNotificationToggle('daily_report_on_sms')}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="font-bold">24 Hour Threshold</span>
                    <div className="flex items-center mt-2 gap-2">
                      <span>Email</span>
                      <Toggle
                        checked={contactSettings.exceed24h_on}
                        onChange={() => handleNotificationToggle('exceed24h_on')}
                      />
                    </div>
                    <div className="flex items-center mt-2 gap-2">
                      <span>Text</span>
                      <Toggle
                        checked={contactSettings.exceed24h_on_sms}
                        onChange={() => handleNotificationToggle('exceed24h_on_sms')}
                      />
                    </div>
                  </div>

                  <div className={`${convertTier(user) < 3 ? 'opacity-40' : ''}`}>
                    <span className="font-bold">Forecast</span>
                    <div className="flex items-center mt-2 gap-2">
                      <span>Email</span>
                      <Toggle
                        checked={contactSettings.forecast_on && convertTier(user) > 2}
                        onChange={() => handleNotificationToggle('forecast_on')}
                        tier={convertTier(user) > 2}
                      />
                    </div>
                    <div className="flex items-center mt-2 gap-2">
                      <span>Text</span>
                      <Toggle
                        checked={contactSettings.forecast_on_sms && convertTier(user) > 2}
                        onChange={() => handleNotificationToggle('forecast_on_sms')}
                        tier={convertTier(user) > 2}
                      />
                    </div>
                  </div>

                  <div className={`${convertTier(user) < 2 ? 'opacity-40' : ''}`}>
                    <span className="font-bold">NOAA Atlas 14</span>
                    <div className="flex items-center mt-2 gap-2">
                      <span>Email</span>
                      <Toggle
                        checked={contactSettings.atlas14_24h_on && convertTier(user) > 1}
                        onChange={() => handleNotificationToggle('atlas14_24h_on')}
                        tier={convertTier(user) > 1}
                      />
                    </div>
                    <div className="flex items-center mt-2 gap-2">
                      <span>Text</span>
                      <Toggle
                        checked={contactSettings.atlas14_24h_on_sms && convertTier(user) > 1}
                        onChange={() => handleNotificationToggle('atlas14_24h_on_sms')}
                        tier={convertTier(user) > 1}
                      />
                    </div>
                  </div>

                  <div className={`${convertTier(user) < 3 ? 'opacity-40' : ''}`}>
                    <span className="font-bold">RapidRain</span>
                    <div className="flex items-center mt-2 gap-2">
                      <span>Email</span>
                      <Toggle
                        checked={contactSettings.rapidrain_on && convertTier(user) > 2}
                        onChange={() => handleNotificationToggle('rapidrain_on')}
                        tier={convertTier(user) > 2}
                      />
                    </div>
                    <div className="flex items-center mt-2 gap-2">
                      <span>Text</span>
                      <Toggle
                        checked={contactSettings.rapidrain_on_sms && convertTier(user) > 2}
                        onChange={() => handleNotificationToggle('rapidrain_on_sms')}
                        tier={convertTier(user) > 2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between">
                <button type="submit" className="bg-[#128CA6] text-white px-4 py-2 rounded hover:bg-green-600">
                  {'Update Profile'}
                </button>
              </div>
            </form>
            <WorkingDialog showDialog={showDialog} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserForm;
