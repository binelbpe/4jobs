import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import recruiterReducer from './slices/recruiterSlice'; 
const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer, 
    recruiter: recruiterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
