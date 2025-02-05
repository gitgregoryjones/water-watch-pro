import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utility/api';
import { FaTimes } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import WorkingDialog from './WorkingDialog';
import { VITE_PRICES_LINK } from '../utility/constants';
import { convertTier } from '../utility/loginUser';

const LocationForm = ({ locationToEdit = null, onSubmitSuccess }) => {
  const user = useSelector((state) => state.userInfo.user);
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [h24Threshold, setH24Threshold] = useState('');
  const [rapidRainThreshold, setRapidRainThreshold] = useState();
  const [responseData, setResponseData] = useState(null); // Store response data
  const [isWorking, setIsWorking] = useState(false)
  const isEditMode = locationToEdit !== null;
  const [msg,setMsg] = useState("")

  const navigate = useNavigate();

  useEffect(() => {
    if (isEditMode) {
      // Prepopulate form fields with location data for editing
      setName(locationToEdit.name || '');
      setLatitude(locationToEdit.latitude || '');
      setLongitude(locationToEdit.longitude || '');
      setH24Threshold(locationToEdit.h24_threshold || .5);
      setRapidRainThreshold(locationToEdit.rapidrain_threshold || locationToEdit.h24_threshold);
      
      

    }
  }, [locationToEdit, isEditMode]);

  const handleSubmit = async (e) => {
    setMsg("");
    setIsWorking(true)
    e.preventDefault();

        if(!name){
          setMsg(<span className="text-[red]">Location name is required</span>)
          setIsWorking(false); 
            return;
        }

       

        if(!latitude || latitude < 24 || latitude > 49 ){
            
            setMsg(<span className="text-[red]">Latitude must be between 24 and 49 degrees</span>)
            setIsWorking(false); 
            return;
        }

        if(longitude > 0 ){
          setLongitude(-longitude);
          
        }

        if(!longitude || longitude < -122 || longitude > -66 ){
            
            setMsg(<span className="text-[red]">Longitude must be between -122 and -66 degrees</span>)
            setIsWorking(false); 

            return;
        }
       
        if(![0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4].includes(parseFloat(h24Threshold))){
            
            setMsg(<span className="text-[red]">24 hour Threshold must be one of 0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4</span>)
            setIsWorking(false); 
            return;
        }

       
        if(!rapidRainThreshold){
            setRapidRainThreshold(h24Threshold)
            
        } else 
        if(![0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4].includes(parseFloat(rapidRainThreshold))){
            
            setMsg(<span className="text-[red]">Rapidrain Threshold must be one of 0.01, 0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2, 3, 4</span>)
            setIsWorking(false); 
            return;
        }
     

    const locationData = {
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      status: 'active',
      h24_threshold: parseFloat(h24Threshold),
      rapidrain_threshold: parseFloat(rapidRainThreshold ? rapidRainThreshold : h24Threshold),
    };

    try {
      let response;
      if (isEditMode) {
        // Update existing location using PATCH
        response = await api.patch(
          `/api/locations/${locationToEdit.id}?client_id=${user.clients[0].id}`,
          locationData
        );
        
      } else {
        // Create new location using POST
        response = await api.post(`/api/locations/?client_id=${user.clients[0].id}`, locationData);
       // alert('Location created successfully!');
      }
      setResponseData(response.data); // Store response data for display
      console.log('Response Data:', response.data); // Log the response data
      setMsg(<span className="text-[green]">Successfully Updated</span>)
      setTimeout(()=>{
        setIsWorking(false); 
       
        navigate("/location-list")
        },2000)
    } catch (error) {
      console.error('Error submitting location:', error.message);
      setMsg(<span className="text-[red]">{error.message}</span>)
      setIsWorking(false)
    }
  };

  const handleDelete = async () => {
    setIsWorking(true)
    if (!isEditMode) {
      setMsg(<span className="text-[red]">{error.message}</span>)
      setIsWorking(false)
      return;
    }

    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await api.delete(`/api/locations/${locationToEdit.id}?client_id=${user.clients[0].id}`);
        //alert('Location deleted successfully!');
        setIsWorking(false)
        onSubmitSuccess(); // Refresh the parent list or close the form
      } catch (error) {
        console.error('Error deleting location:', error.message);
        setIsWorking(false)
        setMsg(<span className="text-[red]">{error.message}</span>)
      }
    }
  };

  return (
    <div className="relative mt-8 p-6 w-full max-w-lg mx-auto bg-white shadow-md rounded-lg">
      
       <button
        onClick={() => navigate('/location-list')}
        className="absolute top-4 right-4 bg-red-400 text-white rounded-full p-2 shadow-lg hover:bg-red-600"
      >
        <FaTimes />
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? `Update :  ${name}` : 'Create New Location'}
      </h2>
      <div className='mb-4'>{msg}</div>
      <form onSubmit={handleSubmit}>
        
        {/* Name */}
        <div className="mb-4">
          <div className='flex justify-between'>
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
            Location Name
          </label>
          {isEditMode && user.role != "admin" && <Link to="/assignments"  className={`text-sm`}>Assign Contacts</Link>}
          </div>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            
          />
        </div>

        {/* Latitude */}
        <div className="mb-4">
          <label htmlFor="latitude" className="block text-gray-700 font-bold mb-2">
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            id="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            
            disabled={isEditMode}
          />
        </div>

        {/* Longitude */}
        <div className="mb-4">
          <label htmlFor="longitude" className="block text-gray-700 font-bold mb-2">
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            id="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            
            disabled={isEditMode}
          />
        </div>

        {/* 24-Hour Threshold */}
        <div className="mb-4">
          <label htmlFor="h24Threshold" className="block text-gray-700 font-bold mb-2">
            24-Hour Rain Threshold (inches)
          </label>
          <select
            
            step="0.01"
            id="h24Threshold"
            value={h24Threshold}
            onChange={(e) => {setH24Threshold(e.target.value); if(convertTier(user) < 2){setRapidRainThreshold(e.target.value)}}}
            className="border border-gray-300 rounded p-2 w-full"
            
          >
                 <option value="">-- Select Threshhold --</option>
           {[.01, .1, .25, .5, .75, 1.0, 1.5, 2, 3, 4].map((o,i)=>{
                return <option value={o} key={i}>{o}</option>
            })
            }
            </select>
        </div>

        {/* RapidRain Threshold */}
        <div className="mb-4">
          <label htmlFor="rapidRainThreshold" className="block text-gray-700 font-bold mb-2">
            RapidRain Threshold (inches)
          </label>
          {convertTier(user) >= 2 ? (<select
            
            
            id="rapidRainThreshold"
            value={rapidRainThreshold}
            onChange={(e) => setRapidRainThreshold(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            
            
            >
              <option value="">-- Select Threshhold --</option>
          
            {[.01, .1, .25, .5, .75, 1.0, 1.5, 2, 3, 4].map((o,i)=>{
                return <option value={o} key={i}>{o}</option>
            })
            }
            </select>) : (<div className='flex w-full flex-col'><input type="text" disabled value={rapidRainThreshold} className="border border-gray-300 rounded p-2 w-full"  name="rapidrain_threshold" />
                          <div className='flex text-sm gap-2'>Upgrade to set distinct RapidRain thresholds <Link to={"/upgrade"}>Upgrade Now</Link></div>
            </div>)}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            {isEditMode ? 'Update Location' : 'Create Location'}
          </button>
          {isEditMode && convertTier(user) >= 2 && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              Delete Location
            </button>
          )}
        </div>
      </form>

      {/* Display Response Data */}
      {responseData && (
        <div className="hidden mt-6 p-4 bg-gray-100 rounded shadow">
          <h3 className="font-bold text-lg text-gray-700">Response Data:</h3>
          <pre className="text-sm text-gray-600">{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
      <WorkingDialog showDialog={isWorking}/>
    </div>
  );
};

export default LocationForm;
