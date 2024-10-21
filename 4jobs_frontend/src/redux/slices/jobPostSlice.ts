import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BasicJobPost, CreateBasicJobPostParams, UpdateBasicJobPostParams } from '../../types/jobPostTypes';
import * as jobPostApi from '../../api/recruiterApi';

interface JobPostState {
  posts: BasicJobPost[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalCount: number;
  currentPage: number;
  selectedPost:BasicJobPost|null;
}

const initialState: JobPostState = {
  posts: [],
  loading: false,
  error: null,
  totalPages: 0,
  totalCount: 0,
  currentPage: 1,
  selectedPost: null, 
};

export const fetchJobPosts = createAsyncThunk(
  'jobPosts/fetchJobPosts',
  async (recruiterId: string, { rejectWithValue }) => {
    try {
      const response = await jobPostApi.getJobPosts(recruiterId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch job posts');
    }
  }
);

export const createJobPost = createAsyncThunk(
  'jobPosts/createJobPost', 
  async (params: CreateBasicJobPostParams, { rejectWithValue }) => {
    try {
      const response = await jobPostApi.createJobPost(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create job post');
    }
  }
);

export const updateJobPost = createAsyncThunk(
  'jobPosts/updateJobPost', 
  async (params: UpdateBasicJobPostParams, { rejectWithValue }) => {
    try {
      const response = await jobPostApi.updateJobPost(params);
      return response;
    } catch (error: any) {
      console.error('Error in updateJobPost thunk:', error);
      return rejectWithValue(error instanceof Error ? error :'Failed to update job post');
    }
  }
);

export const deleteJobPost = createAsyncThunk(
  'jobPosts/deleteJobPost', 
  async (id: string, { rejectWithValue }) => {
    try {
      await jobPostApi.deleteJobPost(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error instanceof Error ? error :'Failed to delete job post');
    }
  }
);

export const fetchJobDetails = createAsyncThunk(
  'jobPosts/fetchJobDetails',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await jobPostApi.fetchJobDetails(jobId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch job details');
    }
  }
);

export const fetchAllJobPosts = createAsyncThunk(
  'jobPosts/fetchAllJobPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jobPostApi.getAllJobPosts();
      return response;
    } catch (error: any) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch all job posts');
    }
  }
);

const jobPostSlice = createSlice({
  name: 'jobPosts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchJobPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch job posts';
      })
      .addCase(createJobPost.pending, (state) => {
        state.error = null;
      })
      .addCase(createJobPost.fulfilled, (state, action) => {
        state.posts.push(action.payload);
      })
      .addCase(createJobPost.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to create job post';
      })
      .addCase(updateJobPost.pending, (state) => {
        state.error = null;
      })
      .addCase(updateJobPost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(updateJobPost.rejected, (state, action) => {
        console.error('Update rejected:', action.payload);
        state.error = action.payload as string || 'Failed to update job post';
      })
      .addCase(deleteJobPost.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteJobPost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
      })
      .addCase(deleteJobPost.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to delete job post';
      })
      .addCase(fetchJobDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchJobDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch job details';
      })
      .addCase(fetchAllJobPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllJobPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchAllJobPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch all job posts';
      });
  },
});


export default jobPostSlice.reducer;
