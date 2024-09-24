import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage for web
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import recruiterReducer from './slices/recruiterSlice';
import jobPostReducer from './slices/jobPostSlice'; // Import the job post reducer
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

// Redux Persist Configuration
const persistConfig = {
  key: 'root',
  storage,
};

// Apply persistence to reducers
const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedAdminReducer = persistReducer(persistConfig, adminReducer);
const persistedRecruiterReducer = persistReducer(persistConfig, recruiterReducer);
const persistedJobPostReducer = persistReducer(persistConfig, jobPostReducer); // Add persisted job post reducer

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    admin: persistedAdminReducer,
    recruiter: persistedRecruiterReducer,
    jobPosts: persistedJobPostReducer, // Add job posts reducer to the store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
