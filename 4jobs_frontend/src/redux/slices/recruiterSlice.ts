import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../redux/store';
import { 
  registerRecruiterApi, 
  loginRecruiterApi, 
  verifyOtpApi, 
  sendOtpApi,
  fetchRecruiterProfileApi,
  updateRecruiterProfileApi // Ensure you import this function
} from '../../api/recruiterApi';

interface RecruiterState {
  recruiter: any | null;
  isAuthenticatedRecruiter: boolean;
  isApproved: boolean;
  loading: boolean;
  error: string | null;
  otpStep: boolean;
  profile: any | null; 
}

const token = localStorage.getItem('recruiterToken');
const initialState: RecruiterState = {
  recruiter: null,
  isAuthenticatedRecruiter: !!token,
  isApproved: false,
  loading: false,
  error: null,
  otpStep: false,
  profile: null,
};

// Create a new thunk for fetching recruiter profile
export const fetchProfile = createAsyncThunk(
  'recruiter/fetchProfile',
  async (recruiterId: string, thunkAPI) => {
    try {
      return await fetchRecruiterProfileApi(recruiterId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  'recruiter/register',
  async (recruiterData: any, thunkAPI) => {
    try {
      const response = await registerRecruiterApi(recruiterData);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const login = createAsyncThunk(
  'recruiter/login',
  async (loginData: any, thunkAPI) => {
    try {
      const response = await loginRecruiterApi(loginData);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'recruiter/verifyOtp',
  async (otpData: any, thunkAPI) => {
    try {
      const response = await verifyOtpApi(otpData);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const sendOtp = createAsyncThunk(
  'recruiter/sendOtp',
  async (email: string, thunkAPI) => {
    try {
      const response = await sendOtpApi(email);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'recruiter/updateProfile',
  async ({ recruiterId, profileData }: { recruiterId: string; profileData: FormData }, thunkAPI) => {
    try {
      return await updateRecruiterProfileApi(recruiterId, profileData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState,
  reducers: {
    logout: (state) => {
      state.recruiter = null;
      state.isAuthenticatedRecruiter = false;
      state.isApproved = false;
      state.otpStep = false;
      state.profile = null; 
      localStorage.removeItem('recruiterToken');
    },
    setOtpStep: (state, action) => {
      state.otpStep = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpStep = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.recruiter = action.payload;
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
        state.isApproved = action.payload.isApproved;
        localStorage.setItem('recruiterToken', action.payload.token);
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
        localStorage.setItem('recruiterToken', action.payload.token);
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
        console.log('OTP sent successfully');
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
      });
  },
});

export const { logout, setOtpStep, clearError } = recruiterSlice.actions;
export default recruiterSlice.reducer;
export const selectRecruiter = (state: RootState) => state.recruiter;
