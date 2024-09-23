import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, SignupCredentials, OtpVerificationCredentials, Certificate } from '../../types/auth';
import { 
  loginUserApi, 
  signupUserApi, 
  verifyOtpApi, 
  googleLoginApi, 
  fetchUserProfileApi, 
  updateUserProfileApi,
  updateUserProjectsApi,
  updateUserCertificatesApi,
  updateUserExperiencesApi,
  updateUserResumeApi
} from '../../api/authapi';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  otpStep: false,
};

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (userId: string, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return thunkAPI.rejectWithValue('No token found');
      }
      const response = await fetchUserProfileApi(userId, token);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue('Failed to fetch user profile');
    }
  }
);

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials, thunkAPI) => {
  try {
    const userData = await loginUserApi(credentials);
    return userData;
  } catch (error) {
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
  }
});

export const googleLogin = createAsyncThunk('auth/google-login', async (googleToken: string, thunkAPI) => {
  try {
    const userData = await googleLoginApi(googleToken);
    return userData;
  } catch (error) {
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
  }
});

export const signup = createAsyncThunk('auth/signup', async (credentials: SignupCredentials, thunkAPI) => {
  try {
    const userData = await signupUserApi(credentials);
    return userData;
  } catch (error) {
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (otpCredentials: OtpVerificationCredentials, thunkAPI) => {
  try {
    const verificationResponse = await verifyOtpApi(otpCredentials);
    return verificationResponse;
  } catch (error) {
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
  }
});

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, formData }: { userId: string; formData: FormData }, thunkAPI) => {
    try {
      const updatedUserData = await updateUserProfileApi(userId, formData);
      return updatedUserData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const updateUserProjects = createAsyncThunk(
  'auth/updateUserProjects',
  async ({ userId, projects }: { userId: string; projects: any[] }, thunkAPI) => {
    try {
      const updatedProjects = await updateUserProjectsApi(userId, projects);
      return updatedProjects;
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const updateUserCertificates = createAsyncThunk(
  'auth/updateUserCertificates',
  async ({ userId, certificates }: { 
    userId: string; 
    certificates: { file: File | null; details: Omit<Certificate, 'file'> }[] 
  }, thunkAPI) => {
    try {
      const updatedCertificatesData = await updateUserCertificatesApi(userId, certificates);
      return updatedCertificatesData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const updateUserExperiences = createAsyncThunk(
  'auth/updateUserExperiences',
  async ({ userId, experiences }: { userId: string; experiences: any[] }, thunkAPI) => {
    try {
      const updatedExperiences = await updateUserExperiencesApi(userId, experiences);
      return updatedExperiences;
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const updateUserResume = createAsyncThunk(
  'auth/updateUserResume',
  async ({ userId, resume }: { userId: string; resume: File }, thunkAPI) => {
    try {
      const updatedResumeData = await updateUserResumeApi(userId, resume);
      return updatedResumeData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setOtpStep: (state, action) => {
      state.otpStep = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = {
          id: action.payload.user.id,
          email: action.payload.user.email,
          name: action.payload.user.name,
          token: action.payload.token,
          role: action.payload.user.role,
          profileImage: action.payload.user.profileImage,
        };
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = {
          id: action.payload.user.id,
          email: action.payload.user.email,
          name: action.payload.user.name,
          token: action.payload.token,
          role: action.payload.user.role,
          profileImage: action.payload.user.profileImage,
        };
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpStep = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action) => {
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
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload,
        };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProjects.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.projects = action.payload;
        }
      })
      .addCase(updateUserProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserCertificates.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.certificates = action.payload;
        }
      })
      .addCase(updateUserCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserExperiences.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.experiences = action.payload;
        }
      })
      .addCase(updateUserExperiences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserResume.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.resume = action.payload;
        }
      })
      .addCase(updateUserResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setOtpStep } = authSlice.actions;
export default authSlice.reducer;