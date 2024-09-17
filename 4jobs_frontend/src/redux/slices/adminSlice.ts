import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminLoginApi, fetchRecruitersApi, approveRecruiterApi } from '../../api/adminApi';

interface AdminState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  dashboardData: any;
  recruiters: any[];
  token: string | null; // Add token to state
}

const initialState: AdminState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  dashboardData: null,
  recruiters: [],
  token: localStorage.getItem('adminToken'), // Retrieve token from localStorage
};

// Thunks
export const loginAdmin = createAsyncThunk(
  'admin/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await adminLoginApi(email, password);
      localStorage.setItem('adminToken', response.token); // Store token
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutAdmin = createAsyncThunk('admin/logout', async () => {
  localStorage.removeItem('adminToken');
  return;
});

export const fetchRecruiters = createAsyncThunk(
  'admin/fetchRecruiters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchRecruitersApi();
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch recruiters');
    }
  }
);

export const approveRecruiter = createAsyncThunk(
  'admin/approveRecruiter',
  async (recruiterId: string, { rejectWithValue }) => {
    try {
      const response = await approveRecruiterApi(recruiterId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve recruiter');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token; // Store token
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.dashboardData = null;
      })
      .addCase(fetchRecruiters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecruiters.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.recruiters = action.payload;
        state.error = null;
      })
      .addCase(fetchRecruiters.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch recruiters';
      })
      .addCase(approveRecruiter.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveRecruiter.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(approveRecruiter.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to approve recruiter';
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
