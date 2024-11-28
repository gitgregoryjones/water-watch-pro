import { createSlice } from '@reduxjs/toolkit';
import {  getUserFromDB} from '../pages/TestData';

const initialState = {
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : getUserFromDB(),
  
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser:  (state,action) => {state.user = action.payload; localStorage.setItem("user",JSON.stringify(state.user))}
  },
});

export const {
  updateUser
} = userSlice.actions;

export default userSlice.reducer;
