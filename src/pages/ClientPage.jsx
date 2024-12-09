import React from 'react';
import { useLocation } from 'react-router-dom';

import ClientForm from '../components/ClientForm';

const ClientPage = () => {
  const { state } = useLocation();
  const clientToEdit = state?.client;
  console.log(`Passed client: ${JSON.stringify(clientToEdit)}`);
  return <ClientForm clientToEdit={clientToEdit} />;
};

export default ClientPage;
