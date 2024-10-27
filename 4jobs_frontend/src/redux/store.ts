import {
  configureStore,
  combineReducers,
  createSelector,
} from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import * as CryptoJS from "crypto-js";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Import all reducers
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import recruiterReducer from "./slices/recruiterSlice";
import jobPostReducer from "./slices/jobPostSlice";
import contestantReducer from "./slices/contestantSlice";
import postReducer from "./slices/postSlice";
import adminJobPostReducer from "./slices/adminJobPostSlice";
import connectionReducer from "./slices/connectionSlice";
import notificationReducer from "./slices/notificationSlice";
import userMessageReducer from "./slices/userMessageSlice";
import recruiterMessageReducer from "./slices/recruiterMessageSlice";
import userRecruiterMessageReducer from "./slices/userRecruiterMessageSlice";
import subscriptionReducer from "./slices/adminSubscriptionSlice";
import userPostReducer from "./slices/adminUserPostSlice";
import userSearchReducer from "./slices/userSearchSlice";
import recruiterSearchReducer from "./slices/recruiterSearchSlice";
import resumeReducer from "./slices/resumeSlice";
import advancedJobSearchReducer from "./slices/advancedJobSearchSlice";

// Encryption setup
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "fallback-key";

interface EncryptedState {
  encryptedState: string;
}

const encryptTransform = createTransform(
  (inboundState, key) => {
    if (key === "auth" || key === "recruiter") {
      return {
        encryptedState: CryptoJS.AES.encrypt(
          JSON.stringify(inboundState),
          ENCRYPTION_KEY
        ).toString(),
      };
    }
    return inboundState;
  },
  (outboundState, key) => {
    if (
      (key === "auth" || key === "recruiter") &&
      typeof outboundState === "object" &&
      outboundState !== null
    ) {
      const encryptedState = (outboundState as EncryptedState).encryptedState;
      if (typeof encryptedState === "string") {
        const decryptedState = CryptoJS.AES.decrypt(
          encryptedState,
          ENCRYPTION_KEY
        ).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedState);
      }
    }
    return outboundState;
  }
);

// Persist configs
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["isAuthenticated", "user", "loading", "AuthState"],
  transforms: [encryptTransform],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  admin: adminReducer,
  recruiter: recruiterReducer,
  jobPosts: jobPostReducer,
  contestants: contestantReducer,
  posts: postReducer,
  adminJobPost: adminJobPostReducer,
  connections: connectionReducer,
  notifications: notificationReducer,
  messages: userMessageReducer,
  recruiterMessages: recruiterMessageReducer,
  userRecruiterMessages: userRecruiterMessageReducer,
  subscriptions: subscriptionReducer,
  userPosts: userPostReducer,
  userSearch: userSearchReducer,
  recruiterSearch: recruiterSearchReducer,
  resume: resumeReducer,
  advancedJobSearch: advancedJobSearchReducer,
});

// Store configuration
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Selectors
const selectConnections = (state: RootState) => state.connections.connections;

export const selectMemoizedConnections = createSelector(
  [selectConnections],
  (connections) => connections
);

export const persistor = persistStore(store);
export default store;
