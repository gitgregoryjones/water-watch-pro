import { configureStore } from '@reduxjs/toolkit';
import locationContactsReducer from './LocationContactsSlice';
import userSliceReducer from './UserSlice';

const store = configureStore({
  reducer: {
    locationContacts: locationContactsReducer,
    userInfo : userSliceReducer
  },
});

export default store;
