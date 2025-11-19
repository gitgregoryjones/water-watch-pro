import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../utility/api';
import WorkingDialog from './WorkingDialog';
import Card from './Card';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../utility/UserSlice';
import ContactForm from './ContactForm';
import fetchByPage from '../utility/fetchByPage';

const UserForm = ({ clientToEdit, myself }) => {

  const user = useSelector((state) => state.userInfo.user);

  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [showDialog, setShowDialog] = useState(false);
  const [msg, setMsg] = useState('');

  
  const dispatch = useDispatch();
  const [contact, setContact] = useState(null);
  const [contactLoading, setContactLoading] = useState(true);
  const [contactError, setContactError] = useState('');

  const loadContact = useCallback(async () => {
    if (!user?.clients?.length) {
      setContact(null);
      setContactLoading(false);
      return;
    }

    try {
      setContactLoading(true);
      setContactError('');
      const rows = await fetchByPage(`/api/contacts/?client_id=${user.clients[0].id}`);
      const match =
        rows.find((row) => row.user_id === user.id) ||
        rows.find((row) => row.email?.toLowerCase() === user.email?.toLowerCase());
      setContact(match || null);
    } catch (err) {
      console.error('Error loading profile contact', err);
      setContactError('Unable to load your contact information. Please refresh and try again.');
    } finally {
      setContactLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const contactInitialValues = useMemo(
    () => ({
      name: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      client_id: user?.clients?.[0]?.id,
      account_name: user?.clients?.[0]?.account_name,
    }),
    [user]
  );
  

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
    <div className="h-full w-full flex flex-col mt-28">
      <h1 className="text-2xl font-bold text-green-800 m-8 self-start">
        User Profile &gt;{firstName} {lastName}
      </h1>

      <Card
        
        className="border-[whitesmoke] bg-[whitesmoke] md:rounded-[unset]"
      >
        <div className="p-6 w-full md:w-full mx-auto bg-white shadow-md rounded-lg">
          <div className="relative mt-0 p-6 w-full mx-auto bg-white rounded-lg">
            

            <h1 className="text-2xl font-bold mb-4">Edit User {firstName}</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div id="msg">{msg}</div>

              {/* First Name */}
              <div className="flex flex-col shadow rounded border p-4">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 font-bold">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border border-gray-300 rounded p-2 w-full"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-gray-700 font-bold">
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
                  <label htmlFor="email" className="block text-gray-700 font-bold">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 rounded p-2 w-full"
                    required
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-gray-300 rounded p-2 w-full"
                    required
                  />
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

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-800">Notification &amp; Contact Preferences</h2>
          <p className="text-sm text-gray-600 mb-4">
            Adjust the alerts and contact details tied to your profile so your notifications stay accurate.
          </p>

          {contactError && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {contactError}
            </div>
          )}

          {contactLoading ? (
            <div className="py-6 text-center text-gray-600">Loading contact preferences...</div>
          ) : contact ? (
            <ContactForm
              contact={contact}
              embedded
              initialValues={contactInitialValues}
              onSaved={loadContact}
            />
          ) : (
            <div className="rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              We couldn't find a contact record associated with your account. Please reach out to your administrator for assistance.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserForm;
