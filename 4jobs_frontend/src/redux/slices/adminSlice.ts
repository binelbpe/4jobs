// src/redux/slices/adminSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  adminLoginApi,
  fetchRecruitersApi,
  approveRecruiterApi,
  fetchUsersApi,
  blockUserApi,
  unblockUserApi,
  fetchDashboardDataApi,
  refreshAdminTokenApi,
} from "../../api/adminApi";

interface User {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

interface AdminState {
  isAuthenticatedAdmin: boolean;
  loading: boolean;
  error: string | null;
  dashboardData: {
    userCount: number;
    recruiterCount: number;
    companyCount: number;
    totalRevenue: number;
    jobPostCount: number;
    userPostCount: number;
    revenueData: { month: string; amount: number }[];
  } | null;
  recruiters: any[];
  users: User[];
  token: string | null;
  email: string;
  name: string;
  role: string;
}

const initialState: AdminState = {
  isAuthenticatedAdmin: false,
  loading: false,
  error: null,
  dashboardData: null,
  recruiters: [],
  users: [],
  token: localStorage.getItem("adminToken"),
  email: "",
  name: "",
  role: "",
};

// Thunks
export const loginAdmin = createAsyncThunk(
  "admin/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminLoginApi(email, password);
      localStorage.setItem("adminToken", response.token);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  "admin/logout",
  async (_, { dispatch }) => {
    localStorage.removeItem("adminToken");
    // Add any other cleanup actions here
  }
);

export const fetchRecruiters = createAsyncThunk(
  "admin/fetchRecruiters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchRecruitersApi();
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch recruiters");
    }
  }
);

export const approveRecruiter = createAsyncThunk(
  "admin/approveRecruiter",
  async (recruiterId: string, { rejectWithValue }) => {
    try {
      const response = await approveRecruiterApi(recruiterId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to approve recruiter");
    }
  }
);

// New User Thunks
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchUsersApi();
      console.log("fetchusers", response);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch users");
    }
  }
);

export const blockUser = createAsyncThunk(
  "admin/blockUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await blockUserApi(userId);
      console.log(response);
      return response.id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to block user");
    }
  }
);

export const unblockUser = createAsyncThunk(
  "admin/unblockUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await unblockUserApi(userId);
      return userId;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to unblock user");
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  "admin/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDashboardDataApi();
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch dashboard data");
    }
  }
);

export const initializeAdminState = createAsyncThunk(
  "admin/initializeState",
  async (_, { dispatch }) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      dispatch(
        loginAdmin.fulfilled({ token }, "", { email: "", password: "" })
      );
    }
  }
);

export const refreshAdminToken = createAsyncThunk(
  'admin/refreshAdminToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await refreshAdminTokenApi();
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLogoutAdmin: (state) => {
      state.isAuthenticatedAdmin = false;
      state.token = null;
      state.dashboardData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticatedAdmin = true;
        state.token = action.payload.token;
        state.name = action.payload.user.name;
        state.email = action.payload.user.email;
        state.role = action.payload.user.role;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.isAuthenticatedAdmin = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isAuthenticatedAdmin = false;
        state.token = null;
        state.dashboardData = null;
      })
      .addCase(fetchRecruiters.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchRecruiters.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loading = false;
          state.recruiters = action.payload;
          state.error = null;
        }
      )
      .addCase(
        fetchRecruiters.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload || "Failed to fetch recruiters";
        }
      )
      // User-related cases
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
      })
      .addCase(blockUser.fulfilled, (state, action: PayloadAction<string>) => {
        const user = state.users.find((user) => user.id === action.payload);
        if (user) {
          console.log(" in block", user);
          user.isBlocked = true;
        }
      })
      .addCase(
        unblockUser.fulfilled,
        (state, action: PayloadAction<string>) => {
          const user = state.users.find((user) => user.id === action.payload);
          if (user) {
            user.isBlocked = false;
          }
        }
      )
      .addCase(approveRecruiter.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        approveRecruiter.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(
        approveRecruiter.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload || "Failed to approve recruiter";
        }
      )
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchDashboardData.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.dashboardData = action.payload;
          state.error = null;
        }
      )
      .addCase(
        fetchDashboardData.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload || "Failed to fetch dashboard data";
        }
      )
      .addCase(refreshAdminToken.fulfilled, (state, action) => {
        state.isAuthenticatedAdmin = true;
        state.token = action.payload.token;
      });
  },
});

export const { clearError, setLogoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
