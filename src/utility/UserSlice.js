import { createSlice } from '@reduxjs/toolkit';
import {  getUserFromDB} from '../pages/TestData';

const initialState = {
  user: getUserFromDB(),
  
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser:  (state,action) => {state.user = action.payload}
  },
});

export const {
  updateUser
} = userSlice.actions;

export default userSlice.reducer;
