import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaCheck } from 'react-icons/fa';

import api from '../utility/api';
import SubHeader from '../components/Subheader';
import Card from '../components/Card';
import ContactCSVFileUploadDialog from '../components/ContactCSVFileUploadDialog';
import { ThemeContext } from '../utility/ThemeContext.jsx';
import { getLinkClasses } from '../utility/getLinkClasses';

const AccountListPage = () => {
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const fetchContacts = async (page) => {
    try {
      const response = await api.get(`/api/contacts/?page=${page}&page_size=250`);
      setContacts(response.data);
      //setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching contacts:', error.message);
    }
  };

  const filterContacts = (e)=> setSearchTerm(e.target.value);

  const  filtered = contacts.filter(l => l.name.toLowerCase().startsWith(searchTerm.toLocaleLowerCase())  );

  const handleDelete = async (contactId) => {
 
    if (window.confirm('Are you sure you want to delete this contact?')) {
    try {
      await api.delete(`/api/contacts/${contactId}`);
      fetchContacts(currentPage); // Refresh the list
    } catch (error) {
      console.error('Error deleting contact:', error.message);
    }
  }
  };

  const handleEdit = (contact) => {
    navigate('/contact-form', { state: { contact } });
  };

  useEffect(() => {
    fetchContacts(currentPage);
  }, [currentPage]);

  return (
    <div className="mt-16 p-6 w-full text-sm flex flex-col items-center font-sans ">
      <h1 className="text-2xl font-bold text-green-800 m-8 self-start">Settings >  Accounts</h1>
      <Card className={'w-full'} header={  <div className=" flex justify-start rounded space-x-6 mb-8 self-start bg-[white] w-full p-2">
        <span className="text-gray-800 font-bold border-b-2 border-blue-500">
          Modify Contacts
        </span>
        <Link
          to="/location-list"
          className={`${getLinkClasses(theme, false)} font-bold border-b-2 border-transparent hover:border-blue-700`}
        >
          Modify Locations
        </Link>
        <Link
          to="/settings-general"
          className={`${getLinkClasses(theme, false)} font-bold border-b-2 border-transparent hover:border-blue-700`}
        >
          Notifications
        </Link>
      </div>
      }>
    <div className="mt-2 p-6 w-full md:w-full mx-auto bg-white shadow-md rounded-lg">
        <div className={`p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center`}><i className='text-yellow-500 fa fa-person'></i>{filtered.length} contacts are viewable. Scroll down see more</div>
         <div className="flex justify-around items-end md:items-center gap-4 mb-6">
        <div className='flex md:flex-row flex-col md:justify-between  flex-1'>
        <input type="text" className='p-2 border border-green-800 rounded text-md flex flex-1' onChange={filterContacts} placeholder='Search Contacts...' value={searchTerm}/>
        </div>
        <button
          onClick={()=>navigate("/contact-form")}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Add Contact
        </button>
      </div>

      <table className="table-auto  block md:w-full  min-h-[300px] h-[300px] overflow-auto  border border-gray-300">
      <thead>
            <tr className="bg-gray-100 sticky top-0 ">
              <th className="text-sm border border-gray-300 p-2 text-center sticky top-0  md:min-w-[300px]">Name</th>
              <th className="text-sm border border-gray-300 p-2 text-left sticky top-0  md:table-cell md:w-full">Email</th>
              <th className="text-sm border border-gray-300 p-2 text-left sticky top-0  md:table-cell md:w-full md:min-w-[300px]">Phone</th>
              <th className="hidden text-sm border border-gray-300 p-2 text-left text-nowrap sticky hidden  top-0">Text Alert</th>
              <th className="hidden text-sm border border-gray-300 p-2 text-left text-nowrap  hidden  sticky top-0">Email Alert</th>
              <th className="hidden text-sm border border-gray-300 p-2 text-left sticky top-0 md:table-cell">Actions</th>
            </tr>
          </thead>
       {filtered.length > 0 ?
        <tbody>
          {filtered.map((contact) => (
            <tr  className={`${window.innerWidth < 800 && 'cursor-pointer'}`} key={contact.id} onClick={()=> window.innerWidth < 800 && handleEdit(contact)}>
              <td className="text-sm border border-gray-300 p-2  md:table-cell text-start">{contact.name}</td>
              <td className="text-sm border border-gray-300 p-2  md:table-cell">{contact.email || 'N/A'}</td>
              <td className="text-sm border border-gray-300 p-2  md:table-cell">{contact.phone || 'N/A'}</td>
              <td className="hidden text-sm border border-gray-300 flex text-center p-2  hidden">
                {contact.sms_notification ? (
                  <FaCheck className="text-green-500 text-center flex justify-center w-full" />
                  
                ) : (
                  <div></div>
                )}
              </td>
              <td className="text-sm border text-center border-gray-300 p-2 hidden ">
                {contact.email_notification ? (
                  <FaCheck className="text-green-500 text-center flex justify-center w-full" />
                ) : (
                  ''
                )}
              </td>
              <td className="text-sm border border-gray-300 p-2  items-center gap-4 hidden md:table-cell ">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="text-blue-500 hover:text-blue-700 px-2"
                    title="Edit Location"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Location"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
            </tr>
          ))}
        </tbody>
        : <tbody className='relative'><i className='absolute text-[green] fa fa-spinner top-[5rem] text-4xl left-1/2 animate-spin'></i></tbody>}
      </table>

      <div className="hidden flex justify-between items-center mt-4">
        
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
     <ContactCSVFileUploadDialog className={'mt-2'} onClose={()=> location.reload()}/>
    </div>
    </Card>
    </div>
  );
};

export default AccountListPage;
