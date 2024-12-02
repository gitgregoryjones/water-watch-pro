import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaCheck } from 'react-icons/fa';

import api from '../utility/api';
import SubHeader from '../components/Subheader';

const ContactListPage = () => {
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchContacts = async (page) => {
    try {
      const response = await api.get(`/api/contacts/?page=${page}&page_size=250`);
      setContacts(response.data);
      //setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching contacts:', error.message);
    }
  };

  const handleDelete = async (contactId) => {
    try {
      await api.delete(`/api/contacts/${contactId}`);
      fetchContacts(currentPage); // Refresh the list
    } catch (error) {
      console.error('Error deleting contact:', error.message);
    }
  };

  const handleEdit = (contact) => {
    navigate('/contact-form', { state: { contact } });
  };

  useEffect(() => {
    fetchContacts(currentPage);
  }, [currentPage]);

  return (
    <div className='h-full min-h-full flex flex-col mt-28'>
        <SubHeader/>
    <div className=" p-6 bg-white rounded w-full h-[20rem] max-h=[20rem] overflow-scroll">
        
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contact List</h1>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => navigate('/contact-form')}
        >
          Add Contact
        </button>
      </div>

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">Phone</th>
            <th className="hidden py-2 px-4 border">Text Alert</th>
            <th className="hidden py-2 px-4 border">Email Alert</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td className="py-2 px-4 border">{contact.name}</td>
              <td className="py-2 px-4 border">{contact.email || 'N/A'}</td>
              <td className="py-2 px-4 border">{contact.phone || 'N/A'}</td>
              <td className="hidden py-2 px-4 border text-center">
                {contact.sms_notification ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  ''
                )}
              </td>
              <td className="hidden py-2 px-4 border text-center">
                {contact.email_notification ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  ''
                )}
              </td>
              <td className="py-2 px-4 border">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                  onClick={() => handleEdit(contact)}
                >
                  <FaEdit />
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  onClick={() => handleDelete(contact.id)}
                >
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          className="hidden bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="hidden bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
    </div>
  );
};

export default ContactListPage;
