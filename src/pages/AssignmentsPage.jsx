import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utility/api';
import Card from '../components/Card';

const AssignmentsPage = () => {
  const user = useSelector((state) => state.userInfo.user);
  
  const [contacts, setContacts] = useState([]);
  const [unassignedContacts, setUnassignedContacts] = useState([]); // For the second select box
  const [assignedContacts, setAssignedContacts] = useState([]); // For the third select box
  const [selectedUnassignedContacts, setSelectedUnassignedContacts] = useState([]);
  const [selectedAssignedContacts, setSelectedAssignedContacts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [locations, setLocations] = useState([]); // Initialize as an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [working,setWorking] = useState(false)
  const pageSize = 250;

  useEffect(() => {
    fetchLocations(currentPage);
  }, [currentPage]);

  const fetchLocations = async (page) => {
    try {
      const response = await api.get(
        `/api/locations/?client_id=${user.clients[0].id}&page=${page}&page_size=${pageSize}`
      );
      setLocations(response.data || []); // Ensure `results` is always an array
      //setTotalPages(Math.ceil(response.data.total / pageSize));
    } catch (error) {
      console.error('Error fetching locations:', error.message);
      setLocations([]); // Fallback to an empty array in case of an error
    }
  };

  useEffect(() => {
    // Fetch all contacts for the user
    api.get('/api/contacts')
      .then((response) => {
        const contactNames = response.data.map((contact) => ({
          id: contact.id,
          name: contact.name,
        }));
        setContacts(contactNames);
        setUnassignedContacts(contactNames); // Initially, all contacts are unassigned
      })
      .catch((error) => {
        console.error('Error fetching contacts:', error.message);
      });
  }, []);

  const fetchAssignedContacts = () => {
    if (selectedLocation) {
      setWorking(true)
      api
        .get(`/api/locations/${selectedLocation}/contacts?page=1&page_size=50`)
        .then((response) => {
          const assigned = response.data.map((contact) => ({
            id: contact.id,
            name: contact.name,
          }));
          setAssignedContacts(assigned);

          // Remove assigned contacts from the unassigned list
          setUnassignedContacts(
            contacts.filter((contact) => !assigned.some((a) => a.id === contact.id))
          );
        })
        .catch((error) => {
          console.error('Error fetching assigned contacts:', error.message);
        }).finally(()=> setWorking(false));
    }
  };

  useEffect(fetchAssignedContacts, [selectedLocation, contacts]);

  const handleAssign = () => {
    if (!selectedLocation) {
      alert('Please select a location first.');
      return;
    }

    selectedUnassignedContacts.forEach((contact) => {
      api
        .post(`/api/contacts/${contact.id}/locations/${selectedLocation}`)
        .then(() => {
          console.log(`Successfully assigned ${contact.name} to location ${selectedLocation}`);
          fetchAssignedContacts(); // Refresh assigned contacts
        })
        .catch((error) => {
          console.error(`Error assigning contact ${contact.name}:`, error.message);
        });
    });

    setSelectedUnassignedContacts([]); // Clear selection
  };

  const handleUnassign = () => {
    if (!selectedLocation) {
      alert('Please select a location first.');
      return;
    }

    selectedAssignedContacts.forEach((contact) => {
      api
        .delete(`/api/contacts/${contact.id}/locations/${selectedLocation}?client_id=${user.clients[0].id}`)
        .then(() => {
          console.log(`Successfully unassigned ${contact.name} from location ${selectedLocation}`);
          fetchAssignedContacts(); // Refresh both unassigned and assigned contacts
        })
        .catch((error) => {
          console.error(`Error unassigning contact ${contact.name}:`, error.message);
        });
    });

    setSelectedAssignedContacts([]); // Clear selection
  };

  const filterLocations = (e)=> setSearchTerm(e.target.value);
 
  const  filtered = locations.filter(l => l.name.startsWith(searchTerm)  );

  return (
    <div className="mt-16 md:p-6 w-full text-sm flex flex-col items-center ">
      {/* Top Navigation Links */}
      <h1 className="text-2xl font-bold text-green-800 m-8 self-start">Assignments > Assign Contacts</h1>
     
      <div className="hidden flex justify-start rounded space-x-6 mb-8 self-start bg-[white] w-full p-2">
        <Link
          to="/assign-locations"
          className="text-blue-500 hover:text-blue-700 font-bold border-b-2 border-transparent hover:border-blue-700"
        >
          Assign Locations
        </Link>
        <span className="text-gray-800 font-bold border-b-2 border-blue-500">
          Assign Contacts
        </span>
      </div>

      {/* Page Content */}
     <Card header={<div className="flex justify-start rounded space-x-6 mb-8 self-start  w-full p-2">
        <Link
          to="/assign-locations"
          className="text-blue-500 hover:text-blue-700 font-bold border-b-2 border-transparent hover:border-blue-700"
        >
          Assign Locations
        </Link>
        <span className="text-gray-800 font-bold border-b-2 border-blue-500">
          Assign Contacts
        </span>
      </div>} footer={``} className={'w-full  border-[whitesmoke] bg-[whitesmoke]  md:rounded-[unset]'}> 
      <div className="gap-4 flex flex-col md:flex-row  w-full  ">
        {/* Locations Select */}
        <div className='flex flex-col bg-[white] p-4 rounded shadow md:w-1/2  md:h-[30rem]'>
        <div className={`p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center`}><span className='text-sm text-[white] px-3 py-1 rounded-2xl font-bold bg-[black]'>1</span> 
            Choose A Location
          </div>
          <select
            id="locations"
            className="border border-gray-300 rounded p-2 w-full md:h-[75%]"
            size="10"
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">-- Select Location --</option>
            {filtered.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <input type="text" className='p-2 mt-2 border border-green-800 rounded text-md' onChange={filterLocations} placeholder='Search Locations...' value={searchTerm}/>
        </div>

        {/* Unassigned Contacts Select */}
        <div className='bg-[white] p-4 rounded shadow min-w-[400px]'>
        <div className={`p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center`}><span className='text-sm text-[white] font-bold px-3 py-1 rounded-2xl bg-[black]'>2</span> 
            Choose 1 or more contacts
          </div>
          <select
            id="unassignedContacts"
            className="border border-gray-300 rounded p-2 w-full md:h-[75%]"
            size="10"
            multiple
            value={selectedUnassignedContacts.map((contact) => contact.id)}
            onChange={(e) => {
              const options = Array.from(e.target.options);
              const selected = options
                .filter((option) => option.selected)
                .map((option) => unassignedContacts.find((contact) => contact.id === Number(option.value)));
              setSelectedUnassignedContacts(selected);
            }}
          >
            {unassignedContacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
          >
            <span className='text-sm text-[white] font-bold px-3 py-2 rounded-2xl bg-[black]'>3</span>  Click To Assign >>
          </button>
        </div>

        {/* Assigned Contacts Select */}
        <div className='bg-[white] p-4 rounded shadow min-w-[400px]'>
        <div className={`p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center`}><span className='text-sm text-[white] font-bold px-3 py-1 rounded-2xl bg-[black]'>4</span> 
            View Assigned Contacts
          </div>
          <select
            id="assignedContacts"
            className="border border-gray-300 rounded p-2 w-full md:h-[75%]"
            
            size="10"
            multiple
            value={selectedAssignedContacts.map((contact) => contact.id)}
            onChange={(e) => {
              const options = Array.from(e.target.options);
              const selected = options
                .filter((option) => option.selected)
                .map((option) => assignedContacts.find((contact) => contact.id === Number(option.value)));
              setSelectedAssignedContacts(selected);
            }}
          >
            {assignedContacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleUnassign}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
          >
            &lt;&lt;<span className='text-sm text-[white] font-bold px-3 py-2 rounded-2xl bg-[black]'>5</span>  Unassign Contact
          </button>
        </div>
      </div>
      </Card>

    </div>
    
  );
};

export default AssignmentsPage;
