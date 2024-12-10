import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import api from '../utility/api';
import Toggle from './Toggle';
import WorkingDialog from './WorkingDialog';

const ClientForm = ({ clientToEdit }) => {
  const [accountName, setAccountName] = useState(clientToEdit?.account_name || '');
  const [email, setEmail] = useState(clientToEdit?.invoice_email || '');
  const [phone, setPhone] = useState(clientToEdit?.phone || '');
  const [status, setStatus] = useState(clientToEdit?.status || false); // Toggle for account status
  const [account_type, setAccount_Type] = useState(clientToEdit?.account_type);
  const [invoiceDate, setInvoiceDate] = useState(clientToEdit?.invoice_day);
  const [paymentStatus, setPaymentStatus] = useState(clientToEdit?.last_payment_status);
  const [tier, setTier] = useState(clientToEdit?.tier || 'Bronze'); // Radio button group for tier
  const [showDialog, setShowDialog] = useState(false);

  const [additionalSettings, setAdditionalSettings] = useState({
    turnAccountOn: false,
    suspendAccount: false,
    convertToDemo: false,
    convertToPaid: false,
    sendMarketingTexts: false,
    enableGroupReportService: false,
    enable15MinReports: false,
  });

  const navigate = useNavigate();
  const isEditMode = clientToEdit !== null;

  const handleDelete = async () => {
    if (!clientToEdit) {
      alert('You can only delete an existing client.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        setShowDialog(true);
        await api.delete(`/api/clients/${clientToEdit.id}`);
        setTimeout(() => {
          setShowDialog(false);
          navigate('/settings-admin');
        }, 2000);
      } catch (error) {
        console.error('Error deleting client:', error.message);
        alert('An error occurred while deleting the client.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowDialog(true);

    const payload = {
      account_name: accountName,
      invoice_email:email,
      phone,
      status,
      tier,
      
      account_type
      
    };

    try {
      if (clientToEdit) {
        await api.patch(`/api/clients/${clientToEdit.id}`, payload);
      } else {
        await api.post('/api/clients/', payload);
      }

      setTimeout(() => {
        setShowDialog(false);
        navigate('/settings-admin');
      }, 2000);
    } catch (error) {
      console.error('Error saving client:', error.message);
    }
  };

  const toggleAdditionalSetting = (key) => {
    setAdditionalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="relative mt-24 p-6 w-full max-w-lg mx-auto bg-white shadow-md rounded-lg">
      {/* Close Button */}
      <button
        onClick={() => navigate('/settings-admin')}
        className="absolute top-4 right-4 bg-red-400 text-white rounded-full p-2 shadow-lg hover:bg-red-600"
      >
        <FaTimes />
      </button>

      <h1 className="text-2xl font-bold mb-4">
        {clientToEdit ? `Edit ${accountName}` : 'Add Client'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Account Name */}
       
        <div>
          <label htmlFor="accountName" className="block text-gray-700 font-bold">
            Account Name
          </label>
          <input
            id="accountName"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>

        {/* Email */}
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

        {/* Phone */}
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

        {/* Status Toggle */}
        <div className="hidden flex items-center">
          <Toggle checked={account_type == "paid" ? true : false} onChange={() => setAccount_Type(account_type)} />
          <span className="ml-2">Archive Account</span>
        </div>

        {/* Account Actions */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Account Actions</h2>
          <div className="hidden flex items-center mb-2">
            <Toggle
              checked={additionalSettings.turnAccountOn}
              onChange={() => toggleAdditionalSetting('turnAccountOn')}
            />
            <span className="ml-2">Turn Account On</span>
          </div>
          <div className="flex items-center mb-2">
            <Toggle
              checked={status != "active" ? true : false }
              onChange={() => setStatus(status == "active" ? "inactive" : "active")} 
            />
            <span className="ml-2">Suspend Account</span>
          </div>
          <div className="hidden flex items-center mb-2">
            <Toggle
              checked={additionalSettings.convertToDemo}
              onChange={() => toggleAdditionalSetting('convertToDemo')}
            />
            <span className="ml-2">Convert To Demo Account</span>
          </div>
          <div className="flex items-center mb-2 gap-2">
          <Toggle checked={account_type == "paid" ? true : false} onChange={() => setAccount_Type(account_type == "paid" ? "trial" : "paid")} />
            <div className='flex flex-row gap-2'>
            <span className="">Convert To Paid Account</span>
           
            </div>
          </div>
          <div>
          <label htmlFor="account_type" className="block text-gray-700 font-bold">
            Last Payment Status
          </label>
          <input
            id="paymentStatus"
            type="text"
            value={paymentStatus}
            disabled
            onChange={(e) => setLastPaymentStatus(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div>
        <label htmlFor="invoiceDate" className="block text-gray-700 font-bold">
            Invoice Day
          </label>
          <input
            id="invoiceDate"
            type="text"
            value={invoiceDate}
            disabled
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
          <div className="hidden flex items-center mb-2">
            <Toggle
              checked={additionalSettings.sendMarketingTexts}
              onChange={() => toggleAdditionalSetting('sendMarketingTexts')}
            />
            <span className="ml-2">Send Marketing Texts</span>
          </div>
          <div className="hidden flex items-center mb-2">
            <Toggle
              checked={additionalSettings.enableGroupReportService}
              onChange={() => toggleAdditionalSetting('enableGroupReportService')}
            />
            <span className="ml-2">Enable Group Report Service</span>
          </div>
          <div className="hidden flex items-center">
            <Toggle
              checked={additionalSettings.enable15MinReports}
              onChange={() => toggleAdditionalSetting('enable15MinReports')}
            />
            <span className="ml-2">Enable 15 Minute Data Reports</span>
          </div>
        </div>

        {/* Tier Radio Buttons */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Account Tier</h2>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="bronze"
              name="tier"
              value="bronze"
              checked={tier === 'bronze'}
              onChange={() => setTier('bronze')}
              className="mr-2"
            />
            <label htmlFor="bronze">Bronze</label>
          </div>
          <div className="flex items-center mb-2">
            <input
              type="radio"
              id="silver"
              name="tier"
              value="silver"
              checked={tier === 'silver'}
              onChange={() => setTier('silver')}
              className="mr-2"
            />
            <label htmlFor="silver">Silver</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="gold"
              name="tier"
              value="gold"
              checked={tier === 'gold'}
              onChange={() => setTier('gold')}
              className="mr-2"
            />
            <label htmlFor="gold">Gold</label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {isEditMode ? 'Update Client' : 'Create Client'}
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              Delete Client
            </button>
          )}
        </div>
      </form>
      <WorkingDialog showDialog={showDialog} />
    </div>
  );
};

export default ClientForm;
