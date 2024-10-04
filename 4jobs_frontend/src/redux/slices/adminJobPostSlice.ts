import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BasicJobPost } from '../../types/jobPostTypes';
import { fetchJobPostsApi, blockJobPostApi, unblockJobPostApi } from '../../api/adminApi';

interface AdminJobPostState {
  jobPosts: BasicJobPost[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminJobPostState = {
  jobPosts: [],
  loading: false,
  error: null,
};

export const fetchJobPosts = createAsyncThunk(
  'adminJobPost/fetchJobPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchJobPostsApi();
      console.log("Fetched job posts:", response);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch job posts');
    }
  }
);

export const blockJobPost = createAsyncThunk(
  'adminJobPost/blockJobPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await blockJobPostApi(postId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to block job post');
    }
  }
);

export const unblockJobPost = createAsyncThunk(
  'adminJobPost/unblockJobPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await unblockJobPostApi(postId);
      return response;
} catch (err: any) {
  return rejectWithValue(err.message || 'Failed to unblock job post');
}
}
);

const adminJobPostSlice = createSlice({
name: 'adminJobPost',
initialState,
reducers: {},
extraReducers: (builder) => {
builder
  .addCase(fetchJobPosts.pending, (state) => {
    state.loading = true;
  })
  .addCase(fetchJobPosts.fulfilled, (state, action: PayloadAction<BasicJobPost[]>) => {
    state.loading = false;
    state.jobPosts = action.payload;
    state.error = null;
    console.log("Updated state job posts:", state.jobPosts);
  })
  .addCase(fetchJobPosts.rejected, (state, action: PayloadAction<any>) => {
    state.loading = false;
    state.error = action.payload || 'Failed to fetch job posts';
  })
  .addCase(blockJobPost.fulfilled, (state, action: PayloadAction<BasicJobPost>) => {
    const index = state.jobPosts.findIndex((post) => post._id === action.payload._id);
    if (index !== -1) {
      state.jobPosts[index] = action.payload;
    }
  })
  .addCase(unblockJobPost.fulfilled, (state, action: PayloadAction<BasicJobPost>) => {
    const index = state.jobPosts.findIndex((post) => post._id === action.payload._id);
    if (index !== -1) {
      state.jobPosts[index] = action.payload;
    }
  });
},
});

export default adminJobPostSlice.reducer;