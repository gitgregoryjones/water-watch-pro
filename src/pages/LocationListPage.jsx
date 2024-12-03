import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utility/api';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import SubHeader from '../components/Subheader';

const LocationListPage = () => {
  const user = useSelector((state) => state.userInfo.user);
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]); // Initialize as an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDelete = async (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await api.delete(`/api/locations/${locationId}?client_id=${user.clients[0].id}`);
        alert('Location deleted successfully!');
        fetchLocations(currentPage); // Refresh the list
      } catch (error) {
        console.error('Error deleting location:', error.message);
        alert('An error occurred while deleting the location.');
      }
    }
  };

  const handleAddLocation = () => {
    navigate('/location-form');
  };

  const handleEditLocation = (location) => {
    navigate('/location-form', { state: { location } });
  };

  const filterLocations = (e)=> setSearchTerm(e.target.value);
    
      
     
  

  const  filtered = locations.filter(l => l.name.startsWith(searchTerm)  );

  console.log(`Filtered is ${JSON.stringify(filtered)}`)

  return (
    <div className='h-full w-full md:w-[80%]  flex flex-col mt-28 '>
        <SubHeader/>
    <div className="mt-14 p-6 w-full md:w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg">
        
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Locations</h2>
        <input type="text" className='p-2 border border-green-800 rounded text-md' onChange={filterLocations} placeholder='Search Locations...' value={searchTerm}/>
        <button
          onClick={handleAddLocation}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Add Location
        </button>
      </div>
    
        <table className="table-auto  block md:w-full  min-h-[300px] h-[300px] overflow-auto  border border-gray-300">
          <thead>
            <tr className="bg-gray-100 sticky top-0 ">
              <th className="text-sm border border-gray-300 p-2 text-center sticky top-0 min-w-[70px] md:min-w-[350px]">Name</th>
              <th className="text-sm border border-gray-300 p-2 text-left sticky top-0 hidden md:table-cell">Latitude</th>
              <th className="text-sm border border-gray-300 p-2 text-left sticky top-0 hidden md:table-cell">Longitude</th>
              <th className="text-sm border border-gray-300 p-2 text-left text-nowrap sticky top-0">24h Threshold</th>
              <th className="text-sm border border-gray-300 p-2 text-left text-nowrap  sticky top-0">RapidRain Threshold</th>
              <th className="text-sm border border-gray-300 p-2 text-left sticky top-0">Actions</th>
            </tr>
          </thead>
          {filtered.length > 0 ? 
          <tbody>
       
            {filtered.map((location) => (
              <tr key={location.id} className={`hover:bg-gray-50`}>
                <td className="text-sm border border-gray-300 p-2 text-left">{location.name}</td>
                <td className="text-sm border border-gray-300 p-2 hidden md:table-cell">{location.latitude}</td>
                <td className="text-sm border border-gray-300 p-2 hidden md:table-cell">{location.longitude}</td>
                <td className="text-sm border border-gray-300 p-2 ">{location.h24_threshold}</td>
                <td className="text-sm border border-gray-300 p-2  ">{location.rapidrain_threshold}</td>
                <td className="text-smm border border-gray-300 p-2 flex items-center gap-4">
                  <button
                    onClick={() => handleEditLocation(location)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Location"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
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
     
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`hidden px-4 py-2 rounded ${
            currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Previous
        </button>
        <span className="hidden text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className={`hidden px-4 py-2 rounded ${
            currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Next
        </button>
      </div>
    </div>
    </div>
  );
};

export default LocationListPage;
