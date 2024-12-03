import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utility/api';

const AssignLocations = () => {
  const user = useSelector((state) => state.userInfo.user);
  const locations = user.locations; // User's locations
  const [contacts, setContacts] = useState([]);
  const [unassignedLocations, setUnassignedLocations] = useState([]);
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedUnassignedLocations, setSelectedUnassignedLocations] = useState([]);
  const [selectedAssignedLocations, setSelectedAssignedLocations] = useState([]);

  useEffect(() => {
    // Fetch all contacts for the user
    api.get('/api/contacts')
      .then((response) => {
        const contactList = response.data.map((contact) => ({
          id: contact.id,
          name: contact.name,
        }));
        setContacts(contactList);
      })
      .catch((error) => {
        console.error('Error fetching contacts:', error.message);
      });
  }, []);

  const fetchAssignedLocations = () => {
    if (selectedContact) {
      api
        .get(`/api/contacts/${selectedContact}/locations?page=1&page_size=50`)
        .then((response) => {
          const assigned = response.data.map((location) => ({
            id: location.id,
            name: location.name,
          }));
          setAssignedLocations(assigned);

          // Remove assigned locations from the unassigned list
          setUnassignedLocations(
            locations.filter((location) => !assigned.some((a) => a.id === location.id))
          );
        })
        .catch((error) => {
          console.error('Error fetching assigned locations:', error.message);
        });
    }
  };

  useEffect(fetchAssignedLocations, [selectedContact, locations]);

  const handleAssign = () => {
    if (!selectedContact) {
      alert('Please select a contact first.');
      return;
    }

    selectedUnassignedLocations.forEach((location) => {
      api
        .post(`/api/contacts/${selectedContact}/locations/${location.id}`)
        .then(() => {
          console.log(`Successfully assigned ${location.name} to contact ${selectedContact}`);
          fetchAssignedLocations(); // Refresh assigned locations
        })
        .catch((error) => {
          console.error(`Error assigning location ${location.name}:`, error.message);
        });
    });

    setSelectedUnassignedLocations([]); // Clear selection
  };

  const handleUnassign = () => {
    if (!selectedContact) {
      alert('Please select a contact first.');
      return;
    }

    selectedAssignedLocations.forEach((location) => {
      api
        .delete(`/api/contacts/${selectedContact}/locations/${location.id}?client_id=${user.clients[0].id}`)
        .then(() => {
          console.log(`Successfully unassigned ${location.name} from contact ${selectedContact}`);
          fetchAssignedLocations(); // Refresh both unassigned and assigned locations
        })
        .catch((error) => {
          console.error(`Error unassigning location ${location.name}:`, error.message);
        });
    });

    setSelectedAssignedLocations([]); // Clear selection
  };

  return (
    <div className="mt-16 p-6 w-full flex flex-col items-center font-sans ">
      {/* Top Navigation Links */}
      <div className="flex justify-center space-x-6 mb-8">
        <span className="text-gray-800 font-bold border-b-2 border-blue-500">
          Assign Locations
        </span>
        <Link
          to="/assignments"
          className="text-blue-500 hover:text-blue-700 font-bold border-b-2 border-transparent hover:border-blue-700"
        >
          Assign Contacts
        </Link>
      </div>

      {/* Page Content */}
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Assign Locations</h1>
      <div className="grid grid-cols-3 gap-8 w-full max-w-5xl">
        {/* Contacts Select */}
        <div className='bg-[white] p-4 rounded shadow'>
          <label htmlFor="contacts" className="block text-gray-700 font-bold mb-2">
            1. Choose a Contact:
          </label>
          <select
            id="contacts"
            className="border border-gray-300 rounded p-2 w-full h-40"
            size="10"
            onChange={(e) => setSelectedContact(e.target.value)}
          >
            <option value="">-- Select Contact --</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unassigned Locations Select */}
        <div className='bg-[white] p-4 rounded shadow'>
          <label htmlFor="unassignedLocations" className="block text-gray-700 font-bold mb-2">
            2. Choose one or more Locations:
          </label>
          <select
            id="unassignedLocations"
            className="border border-gray-300 rounded p-2 w-full h-40"
            size="10"
            multiple
            value={selectedUnassignedLocations.map((location) => location.id)}
            onChange={(e) => {
              const options = Array.from(e.target.options);
              const selected = options
                .filter((option) => option.selected)
                .map((option) => unassignedLocations.find((location) => location.id === Number(option.value)));
              setSelectedUnassignedLocations(selected);
            }}
          >
            {unassignedLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
          >
            3. Click to Assign Locations >>
          </button>
        </div>

        {/* Assigned Locations Select */}
        <div className='bg-[white] p-4 rounded shadow'>
          <label htmlFor="assignedLocations" className="block text-gray-700 font-bold mb-2">
            View Assigned Locations:
          </label>
          <select
            id="assignedLocations"
            className="border border-gray-300 rounded p-2 w-full h-40"
            size="10"
            multiple
            value={selectedAssignedLocations.map((location) => location.id)}
            onChange={(e) => {
              const options = Array.from(e.target.options);
              const selected = options
                .filter((option) => option.selected)
                .map((option) => assignedLocations.find((location) => location.id === Number(option.value)));
              setSelectedAssignedLocations(selected);
            }}
          >
            {assignedLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleUnassign}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
          >
            4.Unassign Location(s)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignLocations;
