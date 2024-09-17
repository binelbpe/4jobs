import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../redux/store';
import { registerRecruiterApi, loginRecruiterApi, verifyOtpApi ,sendOtpApi } from '../../api/recruiterApi';

interface RecruiterState {
  recruiter: any | null;
  isAuthenticated: boolean;
  isApproved: boolean;
  loading: boolean;
  error: string | null;
  otpStep: boolean;
}

const token = localStorage.getItem('recruiterToken');
const initialState: RecruiterState = {
  recruiter: null,
  isAuthenticated: !!token,
  isApproved: false,
  loading: false,
  error: null,
  otpStep: false,
};

export const register = createAsyncThunk(
  'recruiter/register',
  async (recruiterData: any, thunkAPI) => {
    try {
      const response = await registerRecruiterApi(recruiterData);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      } else {
        return thunkAPI.rejectWithValue('An unknown error occurred');
      }
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
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      } else {
        return thunkAPI.rejectWithValue('An unknown error occurred');
      }
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
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      } else {
        return thunkAPI.rejectWithValue('An unknown error occurred');
      }
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
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      } else {
        return thunkAPI.rejectWithValue('An unknown error occurred');
      }
    }
  }
);


const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState,
  reducers: {
    logout: (state) => {
      state.recruiter = null;
      state.isAuthenticated = false;
      state.isApproved = false;
      state.otpStep = false;
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
        state.isAuthenticated = true;
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
        state.isAuthenticated = true;
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
      });
  },
});

export const { logout, setOtpStep, clearError } = recruiterSlice.actions;
export default recruiterSlice.reducer;
export const selectRecruiter = (state: RootState) => state.recruiter;
