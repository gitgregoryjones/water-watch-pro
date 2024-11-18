import { createSlice } from '@reduxjs/toolkit';
import { getLocationsFromDB, getContactsFromDB } from '../pages/TestData';

const initialState = {
  locations: getLocationsFromDB(),
  contacts: getContactsFromDB(),
};

const locationContactsSlice = createSlice({
  name: 'locationContacts',
  initialState,
  reducers: {
    addLocation: (state, action) => {
      state.locations.push(action.payload);
    },
   
    updateLocation: (state, action) => {
      const index = state.locations.findIndex(loc => loc.id === action.payload.id);
      if (index !== -1) state.locations[index] = action.payload;
    },
    deleteLocation: (state, action) => {
      state.locations = state.locations.filter(loc => loc.id !== action.payload);
    },
    addContact: (state, action) => {
      state.contacts.push(action.payload);
    },
    updateContact: (state, action) => {
      const index = state.contacts.findIndex(contact => contact.id === action.payload.id);
      if (index !== -1) state.contacts[index] = action.payload;
    },
    deleteContact: (state, action) => {
      state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
    },

  },
});

export const {
  addLocation,
  updateLocation,
  deleteLocation,
  addContact,
  updateContact,
  deleteContact,
} = locationContactsSlice.actions;

export default locationContactsSlice.reducer;
