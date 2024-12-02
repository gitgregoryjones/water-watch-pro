import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LocationForm from '../components/LocationForm';

export default function LocationPage() {
  const { state } = useLocation(); // Access the state passed via navigate
  const locationToEdit = state?.location; // Safely access the location data
  const navigate = useNavigate();

  function onSubmitSuccess(){

        navigate("/location-list")

  }

  console.log(`Passed location: ${JSON.stringify(locationToEdit)}`);

  return <LocationForm locationToEdit={locationToEdit} onSubmitSuccess={onSubmitSuccess} />;
}
