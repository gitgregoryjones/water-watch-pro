import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import SubHeader from '../components/Subheader';
import Card from '../components/Card';
import Toggle from '../components/Toggle';
import api from '../utility/api';
import Upgrade from '../components/Upgrade';
import { useSelector } from 'react-redux';
import WorkingDialog from '../components/WorkingDialog';
import SettingsMenu from '../components/SettingsMenu';
import {VITE_FEATURE_RAPIDRAIN_FIRST} from "../utility/constants"
import { convertTier } from '../utility/loginUser';

const GeneralSettingsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.userInfo.user);
  const [settings, setSettings] = useState({});
  const [client, setClient] = useState(user.clients[0] ? user.clients[0] : {})
  const [working, setWorking] = useState(false);
  const [msg,setMsg] = useState("")

  

  useEffect(() => {
    // Fetch client data on component load
    
    const fetchClientData = async () => {
      if (!client.id) return;

      try {
        const response = await api.get(`/api/clients/${client.id}`);
        setClient(response.data);
        setSettings({
          account_name: response.data.account_name || '',
          status: response.data.status || 'inactive',
          account_type: response.data.account_type || 'trial',
          tier: response.data.tier || 'bronze',
          manual_invoice: response.data.manual_invoice || false,
          invoice_period: response.data.invoice_period || '',
          invoice_day: response.data.invoice_day || 0,
          invoice_email: response.data.invoice_email || '',
          daily_report_on: response.data.daily_report_on || false,
          daily_report_combine_locations: response.data.daily_report_combine_locations || false,
          daily_report_suppress_zero: response.data.daily_report_suppress_zero || true,
          sort_by_rainfall: response.data.sort_by_rainfall || false,
          only_show_locations_with_non_zero: response.data.only_show_locations_with_non_zero || false,
          forecast_on: response.data.forecast_on || false,
          forecast_combine_locations: response.data.forecast_combine_locations || false,
          atlas14_on: response.data.atlas14_on || false,
          atlas14_24h_on: response.data.atlas14_24h_on || false,
          atlas14_1h_on: response.data.atlas14_1h_on || false,
          atlas14_first_on: response.data.atlas14_first_on || false,
          exceed24h_on: response.data.exceed24h_on || false,
          exceed24h_combine_locations: response.data.exceed24h_combine_locations || false,
          rapidrain_on: response.data.rapidrain_on || false,
          rapidrain_combine_locations: response.data.rapidrain_combine_locations || false,
          rapidrain_first_on: response.data.rapidrain_first_on || false
        });
      } catch (error) {
        console.error('Error fetching client data:', error.message);
        alert('Failed to load client data.');
      }
    };

    fetchClientData();
  }, [client.id]);

 

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async () => {
    setWorking(true)
    setMsg("")
    try {
      await api.patch(`/api/clients/${client.id}`, settings);
      //alert('Settings updated successfully!');
      setTimeout(() => {
        setWorking(false);
        setMsg(<span className="text-[green]">Settings updated Successfully</span>)
        navigate('/settings-general');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating settings:', error.message);
      setWorking(false)
      setMsg('An error occurred while updating settings.');
    }
  };

  return (
    <div className="h-full w-full flex flex-col mt-28">
      <h1 className="text-2xl font-bold text-green-800 m-8 self-start">
        Settings &gt; Client: {client.account_name}  
      </h1>
      <Card
        header={
          <SettingsMenu activeTab={"notifications"}/>
        }
        className={'border-[whitesmoke] bg-[whitesmoke] md:rounded-[unset]'}
      >
        <div className="p-6 w-full md:w-full mx-auto bg-white shadow-md rounded-lg">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div>{msg}</div>
            <h2 className='py-4 px-2 border rounded bg-[#128CA6] text-[white]'>Note: The options below set notifications system wide. Modify contact settings to override settings for individual users</h2>
            {/* Daily Report Section */}
            {/* 
             daily_report_suppress_zero: response.data.daily_report_suppress_zero || true,
          sort_by_rainfall: response.data.sort_by_rainfall || false,
          only_show_locations_with_non_zero: response.data.only_show_locations_with_non_zero || false,
            */}
            <div className="border p-6 rounded shadow-md">
              <h2 className="text-xl font-bold mb-4">Daily Report</h2>
              <div className="flex items-center mb-4 gap-2">
                <Toggle
                  checked={settings.daily_report_on}
                  onChange={() => handleToggle('daily_report_on')}
                />
                <span className="">Enabled</span>
                
              </div>
              <div className='ml-[56px] mb-4'>All contacts will receive the daily report, sent at 6 am EDT
              </div>
              <div className="hidden flex items-center mb-4 gap-2">
                <Toggle
                  checked={settings.daily_report_suppress_zero}
                  onChange={() => handleToggle('daily_report_suppress_zero')}
                />
                <span className="">Supress Locations with 0 rainfall from the report</span>
                
              </div>
              <div className="flex items-center mb-4 gap-2">
                <Toggle
                  checked={settings.sort_by_rainfall}
                  onChange={() => handleToggle('sort_by_rainfall')}
                />
                <span className="">Sort highest to lowest in the daily report</span>
                
              </div>
              <div className="flex items-center mb-4 gap-2">
                <Toggle
                  checked={settings.only_show_locations_with_non_zero}
                  onChange={() => handleToggle('only_show_locations_with_non_zero')}
                />
                <span className="">Show only non-zero values</span>
                
              </div>
             
              <div className="hidden flex items-center">
                
                <Toggle
                  checked={settings.daily_report_combine_locations}
                  onChange={() => handleToggle('daily_report_combine_locations')}
                />
                <span className="ml-4">Combine Locations</span>
              </div>
              
            </div>

            {/* 24 Hour Threshold Section */}
            <div className="border p-6 rounded shadow-md flex flex-col gap-2">
              <h2 className="text-xl font-bold mb-4">24 Hour Threshold Exceeded</h2>
              <div className="flex items-center">
                <Toggle
                  checked={settings.exceed24h_on}
                  onChange={() => handleToggle('exceed24h_on')}
                />
                <span className="ml-2">Enabled</span>
               
              </div>
              <div className='ml-[56px] mb-4'>All contacts receive notification when assigned locations exceed the 24-hour threshold
              </div>
              <div className="flex items-center">
                <Toggle
                  checked={settings.exceed24h_combine_locations}
                  onChange={() => handleToggle('exceed24h_combine_locations')}
                />
                <span className="ml-2">Combine Locations</span>
              </div>
              <div className='ml-[56px] flex flex-col gap-2'><span>Notification for multiple locations combined into a single email or text. Recommended for accounts with many locations.</span>
<span>If turned off, contacts receive individual text and email notifications for each location exceeding the threshold.</span>
</div>
            </div>
            <Upgrade tier={1} showMsg={false}>
            {/* Forecast Section */}
            <div className={`border p-6 rounded shadow-md flex flex-col gap-2 ${convertTier(user) < 3 ? 'opacity-40' : ''}`}>
              <h2 className="text-xl font-bold mb-4">Forecast</h2>
              <div className="flex items-center ">
                <Toggle
                  checked={settings.forecast_on && convertTier(user) > 2}
                  onChange={() => handleToggle('forecast_on')}
                  tier={convertTier(user) > 2}
                />
                <span className="ml-2">Enabled</span>
              </div>
              <div className='ml-[56px] mb-4'>All contacts receive notification when assigned locations are forecast exceed the 24-hour threshold. 

              </div>
              <div className="flex items-center">
                <Toggle
                  checked={settings.forecast_combine_locations && convertTier(user) > 2}
                  onChange={() => handleToggle('forecast_combine_locations')}
                  tier={convertTier(user) > 2}
                />
                <span className="ml-2">Combine Locations</span>
              </div>
              <div className='ml-[56px] flex flex-col gap-2'><span>Notification for multiple locations combined into a single email or text. Recommended for accounts with many locations.</span>
<span>If turned off, contacts receive individual text and email notifications
</span>
</div>
            </div>
            </Upgrade>
            <Upgrade tier={1} showMsg={false}>
            {/* NOAA Atlas 14 Section */}
            <div className={`border p-6 rounded shadow-md flex flex-col gap-2 ${convertTier(user) < 2 ? 'opacity-40' : ''}`}>
              <h2 className="text-xl font-bold mb-4">NOAA Atlas 14</h2>
              <div className="hidden flex items-center ">
                <Toggle
                  checked={settings.atlas14_on}
                  onChange={() => handleToggle('atlas14_on')}
                />
                <span className="ml-4">Enabled</span>
              </div>
              <div className="flex items-center ">
                <Toggle
                  checked={settings.atlas14_24h_on && convertTier(user) > 1}
                  onChange={() => handleToggle('atlas14_24h_on')}
                  tier={convertTier(user) > 1}
                />
                <span className="ml-2">24 Hour</span>
              </div>
              <div className='ml-[56px] mb-4'>Receive notification when 24 hour values exceed NOAA Atlas maximums
              </div>
              <div className="flex items-center">
                <Toggle
                  checked={settings.atlas14_1h_on && convertTier(user) > 1}
                  onChange={() => handleToggle('atlas14_1h_on')}
                  tier={convertTier(user) > 1}
                />
                <span className="ml-2">1 Hour</span>
              </div>
              <div className='ml-[56px] mb-4'>Receive notification when 1 hour values exceed NOAA Atlas maximums
              </div>
              <div className="flex items-center">
                <Toggle
                  checked={settings.atlas14_first_on && convertTier(user) > 1}
                  onChange={() => handleToggle('atlas14_first_on')}
                  tier={convertTier(user) > 1}
                />
                <span className="ml-2">First</span>
              </div>
              <div className='ml-[56px] flex flex-col gap-2'><span>Receive notification the first time values are exceeded.</span>
<span>If turned off, notifications are sent each time the exceedance occurs.
</span>
</div>
            </div>

            {/* RapidRain Alerts */}
            
            <div className={`border p-6 rounded shadow-md flex flex-col gap-2 ${convertTier(user) < 2 ? 'opacity-40' : ''}`}>
              <h2 className="text-xl font-bold mb-4">RapidRain Alerts</h2>
              <div className="flex items-center ">
                <Toggle
                  checked={settings.rapidrain_on && convertTier(user) > 1}
                  onChange={() => handleToggle('rapidrain_on')}
                  tier={convertTier(user) > 1}
                />
                <span className="ml-2">Enabled</span>
                

              </div>
              <div className='ml-[56px] mb-4'>Receive notification when hourly values exceed 15-minute RapidRain thresholds
              </div>
              <div className="flex items-center">
                <Toggle
                  checked={settings.rapidrain_combine_locations && convertTier(user) > 1}
                  onChange={() => handleToggle('rapidrain_combine_locations')}
                  tier={convertTier(user) > 1}
                  
                />
                <span className="ml-2">Combine Locations</span>
               
              </div>
              <div className='ml-[56px] mb-4'>Notifications for multiple locations exceeding the RapidRain thresholds are combined into one email or text.


</div>
{VITE_FEATURE_RAPIDRAIN_FIRST === "true" && <div>
    <div className="flex items-center">
        <Toggle
          checked={settings.rapidrain_first_on}
          onChange={() => handleToggle('rapidrain_first_on')}
          tier={convertTier(user) > 1}
        />
        <span className="ml-2">First</span>
      
      </div>
                  <div className='ml-[56px] mb-4'><span>Receive notification the first time values are exceeded.</span>
    <span>If turned off, notifications are sent each time the exceedance occurs.
    </span>


    </div>
</div>}
            </div>
            </Upgrade>

            {/* Submit Button */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 shadow-md"
              >
                Save Settings
              </button>
            </div>
            <WorkingDialog showDialog={working}/>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default GeneralSettingsPage;
