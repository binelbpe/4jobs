import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BasicJobPost, CreateBasicJobPostParams, UpdateBasicJobPostParams } from '../../types/jobPostTypes';
import * as jobPostApi from '../../api/recruiterApi';

interface JobPostState {
  posts: BasicJobPost[];
  loading: boolean;
  error: string | null;
}

const initialState: JobPostState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchJobPosts = createAsyncThunk(
  'jobPosts/fetchJobPosts',
  async (recruiterId: string, { rejectWithValue }) => {
    try {
      const response = await jobPostApi.getJobPosts(recruiterId);
      console.log("jobpostlist",response)
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch job posts');
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
      return rejectWithValue(error.message || 'Failed to create job post');
    }
  }
);

export const updateJobPost = createAsyncThunk(
  'jobPosts/updateJobPost', 
  async (params: UpdateBasicJobPostParams, { rejectWithValue }) => {
    try {
      console.log("params update jo po",params)
      const response = await jobPostApi.updateJobPost(params);
      console.log('Update response:', response);
      return response;
    } catch (error: any) {
      console.error('Error in updateJobPost thunk:', error);
      return rejectWithValue(error.message || 'Failed to update job post');
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
      return rejectWithValue(error.message || 'Failed to delete job post');
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
        console.log('Update pending');
      })
      .addCase(updateJobPost.fulfilled, (state, action) => {
        console.log('Update fulfilled:', action.payload);
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
      });
  },
});

export default jobPostSlice.reducer;