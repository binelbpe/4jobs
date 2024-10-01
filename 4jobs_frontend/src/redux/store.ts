import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import * as CryptoJS from 'crypto-js';

import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import recruiterReducer from './slices/recruiterSlice';
import jobPostReducer from './slices/jobPostSlice';
import contestantReducer from './slices/contestantSlice';
import postReducer from './slices/postSlice'; 
import adminJobPostReducer from './slices/adminJobPostSlice'; 
import connectionReducer from './slices/connectionSlice'; 
import notificationReducer from './slices/notificationSlice'; // Add this line

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'fallback-key';

interface EncryptedState {
  encryptedState: string;
}

const encryptTransform = createTransform(
  (inboundState, key) => {
    if (key === 'auth' || key === 'recruiter') {
      return { encryptedState: CryptoJS.AES.encrypt(JSON.stringify(inboundState), ENCRYPTION_KEY).toString() };
    }
    return inboundState;
  },
  (outboundState, key) => {
    if ((key === 'auth' || key === 'recruiter') && typeof outboundState === 'object' && outboundState !== null) {
      const encryptedState = (outboundState as EncryptedState).encryptedState;
      if (typeof encryptedState === 'string') {
        const decryptedState = CryptoJS.AES.decrypt(encryptedState, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedState);
      }
    }
    return outboundState;
  }
);

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isAuthenticated', 'user', 'loading', 'AuthState'],
  transforms: [encryptTransform]
};

const adminPersistConfig = {
  key: 'admin',
  storage,
  whitelist: ['isAuthenticatedAdmin', 'dashboardData', 'users', 'loading', 'AdminState'],
};

const recruiterPersistConfig = {
  key: 'recruiter',
  storage,
  whitelist: ['isAuthenticatedRecruiter', 'isApproved', 'recruiterState', 'loading', 'recruiter'],
  transforms: [encryptTransform]
};

const jobPostPersistConfig = {
  key: 'jobPosts',
  storage,
  whitelist: ['posts', 'loading', 'selectedPost', 'JobPostState'],
};

const contestantPersistConfig = {
  key: 'contestants',
  storage,
  whitelist: ['selectedContestant', 'contestants', 'loading', 'ContestantState'],
};

const postPersistConfig = {
  key: 'posts',
  storage,
  whitelist: ['posts', 'loading', 'selectedPost'],
};

const adminJobPostPersistConfig = {
  key: 'adminJobPost',
  storage,
  whitelist: ['jobPosts', 'loading', 'error'],
};


const connectionPersistConfig = {
  key: 'connections',
  storage,
  whitelist: ['recommendations', 'pendingRequests', 'loading', 'error'],
};

const notificationPersistConfig = {
  key: 'notifications',
  storage,
  whitelist: ['items', 'unreadCount'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedAdminReducer = persistReducer(adminPersistConfig, adminReducer);
const persistedRecruiterReducer = persistReducer(recruiterPersistConfig, recruiterReducer);
const persistedJobPostReducer = persistReducer(jobPostPersistConfig, jobPostReducer);
const persistedContestantReducer = persistReducer(contestantPersistConfig, contestantReducer);
const persistedPostReducer = persistReducer(postPersistConfig, postReducer);
const persistedAdminJobPostReducer = persistReducer(adminJobPostPersistConfig, adminJobPostReducer);
const persistedConnectionReducer = persistReducer(connectionPersistConfig, connectionReducer); 
const persistedNotificationReducer = persistReducer(notificationPersistConfig, notificationReducer);

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  admin: persistedAdminReducer,
  recruiter: persistedRecruiterReducer,
  jobPosts: persistedJobPostReducer,
  contestants: persistedContestantReducer,
  posts: persistedPostReducer,
  adminJobPost: persistedAdminJobPostReducer,
  connections: persistedConnectionReducer, 
  notifications: persistedNotificationReducer,
});

const store = configureStore({
  reducer: rootReducer,
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
