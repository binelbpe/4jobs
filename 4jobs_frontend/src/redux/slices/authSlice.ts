import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState,LoginCredentials, SignupCredentials, OtpVerificationCredentials, Certificate } from '../../types/auth';
import axios from 'axios';
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
  updateUserResumeApi,
  fetchJobPostsuser,
  FetchJobPostsParams,
  applyForJob,
  fetchJobPostApi,
  reportJobApi,
  sendForgotPasswordOtpApi,
  verifyForgotPasswordOtpApi,
  resetPasswordApi,
  refreshTokenApi
} from '../../api/authapi';





const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  otpStep: false,
  jobPosts: {
    posts: [],
    loading: false,
    error: null,
    totalPages: 0,
    totalCount: 0,
    currentPage: 1,
    updatedAt: new Date().toISOString()
  },
  selectedPost: null,
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
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message :'Failed to fetch user profile');
    }
  }
);

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials, thunkAPI) => {
  try {
    const userData = await loginUserApi(credentials);
    console.log("userdarta",userData)
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
      return updatedProjects;  // Assuming this returns the updated project list
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
      console.log("updatedCertificatesData",updatedCertificatesData)
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
      console.log("exp",updatedExperiences)
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

export const fetchJobPostsAsync = createAsyncThunk(
  'auth/fetchJobPosts',
  async (params: FetchJobPostsParams = {}, { rejectWithValue }) => {
    try {
      console.log("params",params)
      const response = await fetchJobPostsuser(params);
      console.log("apply",response)
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch job posts');
    }
  }
);

export const applyForJobAsync = createAsyncThunk(
  'auth/applyForJob',
  async ({ userId, jobId }: { userId: string; jobId: string }, { dispatch, rejectWithValue }) => {
    try {
     await applyForJob(userId, jobId);
      
      // Fetch updated job posts after applying
      await dispatch(fetchJobPostsAsync({}));
      
      return jobId;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        // Return the error message from the backend
        return rejectWithValue(error.response.data.error || 'Failed to apply for job');
      }
      return rejectWithValue('Failed to apply for job');
    }
  }
);

export const fetchJobPost = createAsyncThunk(
  'auth/fetchJobPost',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await fetchJobPostApi(jobId);
      console.log(response)
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch job post');
    }
  }
);

export const reportJobAsync = createAsyncThunk(
  'auth/reportJob',
  async ({ userId, jobId, reason }: { userId: string; jobId: string; reason: string }, { rejectWithValue }) => {
    try {
      await reportJobApi(userId, jobId, reason);
      return jobId;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to report job');
      }
      return rejectWithValue('Failed to report job');
    }
  }
);

export const sendForgotPasswordOtp = createAsyncThunk(
  'auth/sendForgotPasswordOtp',
  async (email: string, thunkAPI) => {
    try {
      const response = await sendForgotPasswordOtpApi(email);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const verifyForgotPasswordOtp = createAsyncThunk(
  'auth/verifyForgotPasswordOtp',
  async ({ email, otp }: { email: string; otp: string }, thunkAPI) => {
    try {
      const response = await verifyForgotPasswordOtpApi(email, otp);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, newPassword, otp }: { email: string; newPassword: string; otp: string }, thunkAPI) => {
    try {
      const response = await resetPasswordApi(email, newPassword, otp);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await refreshTokenApi();
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);


export const updateUserAppliedJobs = (jobId: string) => ({
  type: 'auth/updateAppliedJobs',
  payload: jobId,
});

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
    clearError: (state) => {
      state.error = null;
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
          role: action.payload.user.role,
          profileImage: action.payload.user.profileImage,
          appliedJobs: action.payload.user.appliedJobs,
          bio:action.payload.user.bio,
        };
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        console.log(action.payload)
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
          role: action.payload.user.role,
          profileImage: action.payload.user.profileImage,
          appliedJobs: action.payload.user.appliedJobs,
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
        state.user = {
          id: action.payload.user.id,
          email: action.payload.user.email,
          name: action.payload.user.name,
          role: action.payload.user.role,
          profileImage: action.payload.user.profileImage,
          appliedJobs: action.payload.user.appliedJobs,
        };
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
          state.user = action.payload;
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
      })
      .addCase(fetchJobPostsAsync.pending, (state) => {
        state.jobPosts.loading = true;
        state.jobPosts.error = null;
      })
      .addCase(fetchJobPostsAsync.fulfilled, (state, action) => {
        state.jobPosts.loading = false;
        state.jobPosts.posts = action.payload.jobPosts;
        state.jobPosts.currentPage = action.payload.currentPage;
        state.jobPosts.totalPages = action.payload.totalPages;
        state.jobPosts.totalCount = action.payload.totalCount;
      })
      .addCase(fetchJobPostsAsync.rejected, (state, action) => {
        state.jobPosts.loading = false;
        state.jobPosts.error = action.payload as string;
      })
      .addCase(applyForJobAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyForJobAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.appliedJobs = [...(state.user.appliedJobs || []), action.payload];
        }
      })
      .addCase(applyForJobAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJobPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobPost.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(fetchJobPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(reportJobAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reportJobAsync.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(reportJobAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendForgotPasswordOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendForgotPasswordOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendForgotPasswordOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyForgotPasswordOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyForgotPasswordOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyForgotPasswordOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
      });
  },
});

export const { logout, setOtpStep, clearError  } = authSlice.actions;
export default authSlice.reducer;
