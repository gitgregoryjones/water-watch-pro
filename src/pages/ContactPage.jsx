import React from 'react';
import { useLocation } from 'react-router-dom';
import ContactForm from '../components/ContactForm';

const ContactPage = () => {
  const { state } = useLocation();
  const contactToEdit = state?.contact;
  console.log(`Passed contact: ${JSON.stringify(contactToEdit)}`);
  return <ContactForm contactToEdit={contactToEdit} />;
};

export default ContactPage;
