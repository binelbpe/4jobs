import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { REHYDRATE } from 'redux-persist';
import {
  registerRecruiterApi,
  loginRecruiterApi,
  verifyOtpApi,
  sendOtpApi,
  fetchRecruiterProfileApi,
  updateRecruiterProfileApi,
  refreshRecruiterTokenApi,
} from "../../api/recruiterApi";

interface RecruiterState {
  recruiter: any | null;
  isAuthenticatedRecruiter: boolean;
  isApproved: boolean;
  loading: boolean;
  error: string | null;
  otpStep: boolean;
  profile: any | null;
  subscribed: boolean;
  planDuration: string | null;
  expiryDate: string | null;
}

const initialState: RecruiterState = {
  recruiter: null,
  isAuthenticatedRecruiter: false,
  isApproved: false,
  loading: false,
  error: null,
  otpStep: false,
  profile: null,
  subscribed: false,
  planDuration: null,
  expiryDate: null,
};

// Async thunks
export const register = createAsyncThunk(
  "recruiter/register",
  async (recruiterData: any, { rejectWithValue }) => {
    try {
      return await registerRecruiterApi(recruiterData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const login = createAsyncThunk(
  "recruiter/login",
  async (loginData: any, { rejectWithValue }) => {
    try {
       const response =await loginRecruiterApi(loginData);
       return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "recruiter/verifyOtp",
  async (otpData: any, { rejectWithValue }) => {
    try {
      return await verifyOtpApi(otpData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const sendOtp = createAsyncThunk(
  "recruiter/sendOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      return await sendOtpApi(email);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "recruiter/fetchProfile",
  async (recruiterId: string, { rejectWithValue }) => {
    try {
      return await fetchRecruiterProfileApi(recruiterId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "recruiter/updateProfile",
  async ({ recruiterId, profileData }: { recruiterId: string; profileData: FormData }, { rejectWithValue }) => {
    try {
      return await updateRecruiterProfileApi(recruiterId, profileData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const updateSubscription = createAsyncThunk(
  "recruiter/updateSubscription",
  async (subscriptionData: { subscribed: boolean; planDuration: string; expiryDate: string }, { rejectWithValue }) => {
    try {
      
      return subscriptionData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }
);

export const refreshRecruiterToken = createAsyncThunk(
  'recruiter/refreshRecruiterToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await refreshRecruiterTokenApi();
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

const recruiterSlice = createSlice({
  name: "recruiter",
  initialState,
  reducers: {
    logout: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem("recruiterToken");
      localStorage.removeItem('recruiterState');
    },
    setOtpStep: (state, action: PayloadAction<boolean>) => {
      state.otpStep = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(REHYDRATE, (state, action: any) => {
        if (action.payload && action.key === 'recruiter') {
          return {
            ...state,
            ...action.payload,
            isAuthenticatedRecruiter: !!localStorage.getItem("recruiterToken"),
          };
        }
        return state;
      })
   
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.recruiter = action.payload;
        state.otpStep = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticatedRecruiter = true;
        state.recruiter = action.payload.recruiter;
        state.isApproved = action.payload.recruiter.isApproved;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
     
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticatedRecruiter = true;
        state.isApproved = action.payload.isApproved;
        localStorage.setItem("recruiterToken", action.payload.token);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
     
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.subscribed = action.payload.subscribed;
        state.planDuration = action.payload.planDuration;
        state.expiryDate = action.payload.expiryDate; 
      
        if (state.recruiter) {
          state.recruiter = {
            ...state.recruiter,
            subscribed: action.payload.subscribed,
            planDuration: action.payload.planDuration,
            expiryDate: action.payload.expiryDate,
          };
        }
      })
      .addCase(refreshRecruiterToken.fulfilled, (state, action) => {
        state.isAuthenticatedRecruiter = true;
        state.recruiter = action.payload.recruiter;
        localStorage.setItem('recruiterToken', action.payload.token);
      });
  },
});

export const { logout, setOtpStep, clearError } = recruiterSlice.actions;
export default recruiterSlice.reducer;
export const selectRecruiter = (state: RootState) => state.recruiter;
