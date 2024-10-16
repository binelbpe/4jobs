import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchUsersAndJobsApi } from '../../api/authapi';
import { User } from '../../types/auth';
import { BasicJobPost } from '../../types/jobPostTypes';

interface UserSearchState {
  users: User[];
  jobPosts: BasicJobPost[];
  loading: boolean;
  error: string | null;
}

const initialState: UserSearchState = {
  users: [],
  jobPosts: [],
  loading: false,
  error: null,
};

export const searchUsersAndJobs = createAsyncThunk(
  'userSearch/searchUsersAndJobs',
  async ({ query, userId }: { query: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await searchUsersAndJobsApi(query, userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const userSearchSlice = createSlice({
  name: 'userSearch',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.users = [];
      state.jobPosts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsersAndJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsersAndJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.jobPosts = action.payload.jobPosts;
      })
      .addCase(searchUsersAndJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSearch } = userSearchSlice.actions;
export default userSearchSlice.reducer;
