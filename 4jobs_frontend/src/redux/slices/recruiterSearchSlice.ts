import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchUsers } from '../../api/recruiterApi';
import { User } from '../../types/auth';

interface RecruiterSearchState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: RecruiterSearchState = {
  users: [],
  loading: false,
  error: null,
};

export const searchUsersAndJobs = createAsyncThunk(
  'recruiterSearch/searchUsersAndJobs',
  async ({ query, userId }: { query: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await searchUsers(query);
      console.log('Search API response:', response); // Debugging log
      return response; // Return the entire response, not just response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred during the search');
    }
  }
);

const recruiterSearchSlice = createSlice({
  name: 'recruiterSearch',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.users = [];
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
        state.users = action.payload; // Directly assign the payload to users
        console.log('Search results updated:', state.users); // Debugging log
      })
      .addCase(searchUsersAndJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSearch } = recruiterSearchSlice.actions;

export default recruiterSearchSlice.reducer;