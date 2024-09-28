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
} from "../../api/recruiterApi";

interface RecruiterState {
  recruiter: any | null;
  isAuthenticatedRecruiter: boolean;
  isApproved: boolean;
  loading: boolean;
  error: string | null;
  otpStep: boolean;
  profile: any | null;
}

const initialState: RecruiterState = {
  recruiter: null,
  isAuthenticatedRecruiter: false,
  isApproved: false,
  loading: false,
  error: null,
  otpStep: false,
  profile: null,
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
      return await loginRecruiterApi(loginData);
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
      // Register
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
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticatedRecruiter = true;
        state.recruiter = action.payload.recruiter;
        state.isApproved = action.payload.isApproved;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
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
      // Send OTP
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
      // Fetch Profile
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
      // Update Profile
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
      });
  },
});

export const { logout, setOtpStep, clearError } = recruiterSlice.actions;
export default recruiterSlice.reducer;
export const selectRecruiter = (state: RootState) => state.recruiter;