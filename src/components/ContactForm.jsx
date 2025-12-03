import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import api from '../utility/api';
import Toggle from './Toggle'; // Import the Toggle component
import { useSelector } from 'react-redux';
import WorkingDialog from './WorkingDialog';
import { convertTier } from '../utility/loginUser';
import {validateEmail} from '../utility/passwordFunc'
import PropTypes from 'prop-types';

const ContactForm = ({ contact = null, embedded = false, initialValues = {}, onSaved }) => {
  const { state } = useLocation();
  const stateContact = state?.contact;
  const user = useSelector((state) => state.userInfo.user);
  const contactToEdit = contact ?? stateContact ?? null;

  const fallbackInitialValues = useMemo(
    () => ({
      name: initialValues.name ?? '',
      email: initialValues.email ?? '',
      phone: initialValues.phone ?? '',
      client_id: initialValues.client_id ?? user?.clients?.[0]?.id,
      account_name: initialValues.account_name ?? user?.clients?.[0]?.account_name,
    }),
    [initialValues, user?.clients]
  );
  
  const [name, setName] = useState(contactToEdit?.name || fallbackInitialValues.name || '');
  const [email, setEmail] = useState(contactToEdit?.email || fallbackInitialValues.email || '');
  const [phone, setPhone] = useState(contactToEdit?.phone || fallbackInitialValues.phone || '');


  const [client_id, setClient_Id] = useState(contactToEdit?.client_id || fallbackInitialValues.client_id)
  const [accountName, setAccountName] = useState(contactToEdit?.account_name || fallbackInitialValues.account_name)
  const [daily_report_on, set] = useState(contactToEdit?.account_name)
  const [role,setRole] = useState("contact");
  const [msg,setMsg] = useState(null)

  const [formData, setFormData] = useState({
    daily_report_on: contactToEdit ? contactToEdit?.daily_report_on : (initialValues.daily_report_on ?? true),
    daily_report_on_sms: contactToEdit ? contactToEdit?.daily_report_on_sms  : (initialValues.daily_report_on_sms ?? true),
    exceed24h_on: contactToEdit ? contactToEdit?.exceed24h_on : (initialValues.exceed24h_on ?? true),
    exceed24h_on_sms: contactToEdit ? contactToEdit?.exceed24h_on_sms  : (initialValues.exceed24h_on_sms ?? true),
      forecast_on: contactToEdit? contactToEdit?.forecast_on   : (initialValues.forecast_on ?? true),
      forecast_on_sms: contactToEdit? contactToEdit?.forecast_on_sms  : (initialValues.forecast_on_sms ?? true),
      atlas14_24h_on: contactToEdit? contactToEdit?.atlas14_24h_on  : (initialValues.atlas14_24h_on ?? true),
      atlas14_24h_on_sms: contactToEdit? contactToEdit?.atlas14_24h_on_sms  : (initialValues.atlas14_24h_on_sms ?? true),

      rapidrain_on: contactToEdit? contactToEdit?.rapidrain_on  : (initialValues.rapidrain_on ?? true),
      rapidrain_on_sms: contactToEdit? contactToEdit?.rapidrain_on_sms  : (initialValues.rapidrain_on_sms ?? true),
      //atlas14_1h_on: contactToEdit?.atlas14_1h_on,
      //atlas14_1h_on_sms: contactToEdit?.atlas14_1h_on_sms,
      //atlas14_first_on: contactToEdit?.atlas14_first_on,
      //atlas14_first_on_sms: contactToEdit?.atlas14_1h_on_sms,
     
      //exceed24h_combine_locations: contactToEdit?.exceed24h_combine_locations
     
  });

  

  const [isAlertSettingsExpanded, setIsAlertSettingsExpanded] = useState(true);

  //alert(`Contact Form Received ${contactToEdit?.user_id} ${contactToEdit.name}`)
  
  const [showDialog, setShowDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState([])

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";
    password += chars[Math.floor(Math.random() * 26)]; // Add an uppercase letter
    password += chars[Math.floor(Math.random() * 10) + 26]; // Add a number
    password += chars[Math.floor(Math.random() * 10) + 52]; // Add a special character
    for (let i = 0; i < 5; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
  };

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
   
   let roleLookup = async ()=>{

    console.log(`Lookup user for clientToEdit ${contactToEdit.user_id}`)
    let adminResp =  await api.get(`/api/clients/${contactToEdit.client_id}/admins`);

    
    let me = adminResp.data.find((e)=> contactToEdit.user_id == e.id)
    if(me){
      console.log(`I found me as ${JSON.stringify(me)} ${contactToEdit.user_id}`)
      setRole("co-owner");
      console.log(`Found Me as co-owner`)
    }

   }

   if(contactToEdit)
    {
      roleLookup();
    }
   
  }, [currentPage])
  

  const [alertSettings, setAlertSettings] = useState({
    'Daily Report': { email: true, sms: true, show:true },
    Forecast: { email: true, sms: true, show: convertTier(user) > 2 },
    'NOAA Atlas 14': { email: true, sms: true, tier:1, show : convertTier(user) > 1 },
    '24 Hour Threshold': { email: true, sms: true, show:true },
    'RapidRain': { email: false, sms: true, tier:4, show : convertTier(user) > 2 },
  });
  
 // alert(`Alert Settings are ${JSON.stringify(alertSettings)}`)

  const isEditMode = contactToEdit !== null;
  const navigate = useNavigate();

  const handlePostSubmit = (payload) => {
    if (typeof onSaved === 'function') {
      onSaved(payload);
    } else {
      navigate('/contact-list');
    }
  };

  const handleDelete = async () => {
    setMsg(null)
    if (!contactToEdit) {
      alert('You can only delete an existing contact.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/api/contacts/${contactToEdit.id}?client_id=${contactToEdit.client_id}`);
        setTimeout(() => {
          setShowDialog(false);
          handlePostSubmit(null);
        }, 2000);
        
      } catch (error) {
        console.error('Error deleting contact:', error.message);
        setMsg(<span className="text-[red]">{error.message}</span>)
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowDialog(true);

    setMsg(null)

    if(!name){
      setMsg(<span className='text-[red]'>A name is required for this contact</span>)
      setShowDialog(false);
      return;
    }

    if(!validateEmail(email)){
      setMsg(<span className='text-[red]'>Email is required in order to create a login for this contact</span>)
      setShowDialog(false);
      return;
    }

    


    if(phone){
      const phoneRegex = /^(\+?\d{1,4}[\s-]?)?(\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}$/;

      // Example usage
      const validatePhoneNumber = (phoneNumber) => phoneRegex.test(phoneNumber);

      
      if(!validatePhoneNumber(phone)){
        setMsg(<span className='text-[red]'>Please enter a valid phone number</span>)
        setShowDialog(false);
        return;
      }
    }

    const payload = {
      name,
      phone,
      email: email ? email : null,
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
      rapidrain_on : formData.rapidrain_on,
      rapidrain_on_sms: formData.rapidrain_on_sms,
    };

    try {
      let rec = {};

      if (embedded && !contactToEdit) {
        throw new Error('Unable to update contact information because your contact record could not be found.');
      }

      if (contactToEdit) {
       rec = await api.patch(`/api/contacts/${contactToEdit.id}`, payload);
      } else {
         rec = await api.post(`/api/contacts/`, payload);
      }

      if(role == "co-owner"){
        //do upsert
        let adminsResp = await api.get(`/api/clients/${rec.data.client_id}/admins`);

        let admins = [];

        admins = adminsResp.data;

        console.log(`User id ${rec.data.user_id}`)

        console.log(`What is an admin ${JSON.stringify(adminsResp)}`)

        let me = admins.find((e)=>{ console.log(JSON.stringify(e)); return e.id == rec.data.user_id})

        console.log(`Me USER ${JSON.stringify(me)} and rec is ${JSON.stringify(rec)}`)

        if(!me){
          console.log(`Me was not found in Admin. Do POST because ${rec.data.user_id} not found in table`)
          await api.post(`/api/clients/${rec.data.client_id}/admins?client_id=${rec.data.client_id}&user_id=${rec.data.user_id}`);
        }
      
      } else {

        try { 
          await api.delete(`/api/clients/${rec.data.client_id}/admins/${rec.data.user_id}`)
        }catch(e){
          console.log(`No Admin record found to delete`);
          console.log(e.message)
        }

      }

      setTimeout(() => {
        setShowDialog(false);
        setMsg(<span className="text-[green]">Contact updated Successfully</span>)
        handlePostSubmit(rec.data);

      }, 2000);
    } catch (error) {
      console.error('Error saving contact:', error.message);
      setShowDialog(false)
      setMsg(<span className="text-[red]">{error.message}</span>)

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
        ( <div className={`flex flex-col mb-4 ${label.toLocaleLowerCase().startsWith("forecast") && convertTier(user) < 3 ? 'hidden' : ''} ${label.toLocaleLowerCase().startsWith("atlas") && convertTier(user) < 2 ? 'hidden' : ''}`} key={header} >
          <span className="font-bold capitalize">{label.trim().replace("on","").replace("atlas14 24h","NOAA Atlas 14").replace("exceed24h","24 Hour Threshold")}</span>
          
          <div className="flex items-center mt-2">
            <span className="mr-2">Email</span>
            <Toggle
              checked={settings[email]}
              onChange={() => handleChange({ name: email, value: !settings[email] })}
            />
          </div>
  
          <div className="flex items-center mt-2">
            <span className="mr-2">Text</span>
            <Toggle
              checked={settings[sms]}
              onChange={() => handleChange({ name: sms, value: !settings[sms] })}
            />
          </div>
        </div>)
      );
    });
  };
  const containerMargin = embedded ? 'mt-4' : (convertTier(user) >= 4 ? 'mt-24' : 'mt-8');
  const embeddedWidth = embedded ? 'w-full' : 'w-full max-w-lg mx-auto';

  return (
    <div className={`relative ${containerMargin} ${embeddedWidth} p-6 bg-[var(--header-bg)]  shadow-md rounded-lg`}>
      {/* Close Button */}
      {!embedded && (
        <button
          onClick={() => navigate('/contact-list')}
          className="absolute top-4 right-4 bg-red-400 text-white rounded-full p-2 shadow-lg hover:bg-red-600"
        >
          <FaTimes />
        </button>
      )}

      <h1 className="text-2xl font-bold mb-4">{contactToEdit ? `Edit` : 'Add Contact'}  </h1>
      <h2 className='mb-2'>{msg}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div>
          <div className="flex justify-between">
            <label htmlFor="name" className="block  font-bold">
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
            
          />
        </div>
        <div>
          <label htmlFor="email" className="block  font-bold">
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
          <label htmlFor="phone" className="block  font-bold">
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
        <div className='flex items-center justify-start gap-2'>
          <label>Make this contact a co-owner</label>
          <Toggle
              checked={role === "co-owner"}
              onChange={(e) => role == "contact" ? setRole("co-owner") : setRole("contact")}
            />
        </div>
       { user.role == "admin" && (<div>
          <label htmlFor="accountName" className="block  font-bold">
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
            {isAlertSettingsExpanded ? 'Hide Notification Settings' : 'Show Notification Settings'}
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
            {embedded || isEditMode ? 'Save Contact' : 'Create Contact'}
          </button>
          {isEditMode && !embedded && (
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

ContactForm.propTypes = {
  contact: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    client_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    account_name: PropTypes.string,
  }),
  embedded: PropTypes.bool,
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    client_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    account_name: PropTypes.string,
    daily_report_on: PropTypes.bool,
    daily_report_on_sms: PropTypes.bool,
    exceed24h_on: PropTypes.bool,
    exceed24h_on_sms: PropTypes.bool,
    forecast_on: PropTypes.bool,
    forecast_on_sms: PropTypes.bool,
    atlas14_24h_on: PropTypes.bool,
    atlas14_24h_on_sms: PropTypes.bool,
    rapidrain_on: PropTypes.bool,
    rapidrain_on_sms: PropTypes.bool,
  }),
  onSaved: PropTypes.func,
};
