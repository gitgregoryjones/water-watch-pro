import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../utility/api';
import Card from '../components/Card';
import fetchByPage from '../utility/fetchByPage';
import WorkingDialog from '../components/WorkingDialog';

const AssignLocations = () => {
  const user = useSelector((state) => state.userInfo.user);
 
  const [locations,setLocations] = useState([])
  const [contacts, setContacts] = useState([]);
  const [unassignedLocations, setUnassignedLocations] = useState([]);
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedUnassignedLocations, setSelectedUnassignedLocations] = useState([]);
  const [selectedAssignedLocations, setSelectedAssignedLocations] = useState([]);
  const [working,setWorking] = useState(false)
  let currentPage = 1;
  let pageSize = 250;


  useEffect(() => {
    fetchLocations(currentPage);
  }, [currentPage]);

  const fetchLocations = async (page) => {
    try {
      let rows = await fetchByPage(`/api/locations/?client_id=${user.clients[0]?.id}`)

      setLocations(rows); // Ensure `results` is always an array
      //setTotalPages(Math.ceil(response.data.total / pageSize));
    } catch (error) {
      console.error('Error fetching locations:', error.message);
      setLocations([]); // Fallback to an empty array in case of an error
    }
  };

  useEffect(() => {
    // Fetch all contacts for the user
 
   
    let b = async()=>{
    try {

    let rows = await fetchByPage(`/api/contacts`)
    setContacts(rows)

   } catch(e){
        console.error('Error fetching contacts:', e.message);
   }
  }

  b();
      
  }, []);

  const fetchAssignedLocations =  () => {
    
    if (selectedContact) {
      setWorking(true)
      
    let b = async () =>{
      let rows = await fetchByPage(`/api/contacts/${selectedContact}/locations?`)

      setAssignedLocations(rows);

      setUnassignedLocations(
        locations.filter((location) => !rows.some((a) => a.id === location.id))
      );

      setWorking(false)

    
      }
      b();
    }
  };

  useEffect(fetchAssignedLocations, [selectedContact, locations]);

  const handleAssign = async () => {
    if (!selectedContact) {
      alert('Please select a contact first.');
      return;
    }

    setWorking(true)

    try {
  
      console.log(`Select UnassignedLocations ${JSON.stringify(selectedUnassignedLocations.map((m)=>m.id))}`)

      let locIds = selectedUnassignedLocations.map((m)=>m.id);

      let assignedResponse = await api.post(`/api/contacts/${selectedContact}/locations`,locIds)

    }catch(e){
      setWorking(false);
      console.log(e.message);
    }

    setWorking(false)

  
    fetchAssignedLocations();
    setSelectedUnassignedLocations([]);
  };

  const handleUnassign = async () => {
    if (!selectedContact) {
      alert('Please select a contact first.');
      return;
    }

    setWorking(true)

    try {
      // Create an array of promises for delete calls

      let locIds = selectedAssignedLocations.map((location)=> location.id)
  
      let assignedResponse = await api.post(`/api/contacts/${selectedContact}/remove_locations`,locIds)
      

      setWorking(false)
  
      // Call fetchAssignedLocations after all delete calls have completed
      fetchAssignedLocations();
    } catch (error) {
      console.error("Error unassigning locations:", error.message);
      setWorking(false)
    }

    setSelectedAssignedLocations([]);
  };

  return (
    <div className="mt-16 md:p-6 w-full text-sm flex flex-col items-center">
      <h1 className="text-2xl font-bold text-green-800 m-8 self-start">Assignments > Assign Locations</h1>

      <Card
        header={
          <div className="flex justify-start rounded space-x-6 mb-8 self-start w-full p-2">
            <span className="text-gray-800 font-bold border-b-2 border-blue-500">Assign Locations</span>
            <Link
              to="/assignments"
              className="text-blue-500 hover:text-blue-700 font-bold border-b-2 border-transparent hover:border-blue-700"
            >
              Assign Contacts
            </Link>
          </div>
        }
        className="w-full border-[whitesmoke] bg-[whitesmoke] md:rounded-[unset]"
      >
        <div className="gap-4 flex flex-col md:flex-row w-full">
          {/* Contacts Select */}
          <div className="bg-[white] p-4 rounded shadow md:w-1/2 md:h-[30rem]">
            <div className="p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center">
              <span className="text-sm text-[white] px-3 py-1 rounded-2xl font-bold bg-[black]">1</span> Choose a Contact
            </div>
            <select
              id="contacts"
              className="border border-gray-300 rounded p-2 w-full md:h-[75%]"
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
          <div className="bg-[white] p-4 rounded shadow min-w-[400px]">
            <div className="p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center">
              <span className="text-sm text-[white] font-bold px-3 py-1 rounded-2xl bg-[black]">2</span> Choose Locations ({unassignedLocations.length})
            </div>
            <select
              id="unassignedLocations"
              className="border border-gray-300 rounded p-2 w-full md:h-[75%]"
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
            <span className="text-sm text-[white] font-bold px-3 py-2 rounded-2xl bg-[black] mr-2 ">3</span><span>  Assign Locations >></span>
            
            </button>
          </div>

          {/* Assigned Locations Select */}
          <div className="bg-[white] p-4 rounded shadow min-w-[400px]">
            <div className="p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center">
              <span className="text-sm text-[white] font-bold px-3 py-1 rounded-2xl bg-[black]">4</span> View Assigned  ({assignedLocations.length})
            </div>
            <select
              id="assignedLocations"
              className="border border-gray-300 rounded p-2 w-full md:h-[75%]"
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
            &lt;&lt; Unassign Locations <span className='text-sm text-[white] font-bold px-3 py-2 rounded-2xl bg-[black]'>5</span> 
            </button>
          </div>
        </div>
      </Card>
      <WorkingDialog showDialog={working}/>
    </div>
  );
};

export default AssignLocations;
