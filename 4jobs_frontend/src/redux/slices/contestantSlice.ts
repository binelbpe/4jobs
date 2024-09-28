// slices/contestantSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserDetails, FetchUsersResponse, FetchUserDetailsResponse, ApiError } from '../../types/auth';
import { fetchJobApplicants, fetchUserDetails } from '../../api/recruiterApi';

interface ContestantState {
  contestants: User[];
  selectedContestant: UserDetails | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: ContestantState = {
  contestants: [],
  selectedContestant: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
};

export const fetchContestantsForJob = createAsyncThunk<
  FetchUsersResponse,
  { jobId: string; page?: number },
  { rejectValue: ApiError }
>('contestants/fetchForJob', async ({ jobId, page = 1 }, { rejectWithValue }) => {
  try {
    const response = await fetchJobApplicants(jobId, page);
    console.log(response)
    return response;
  } catch (error: any) {
    return rejectWithValue({ message: error.message || 'Failed to fetch applicants' });
  }
});

export const fetchContestantDetailsAsync = createAsyncThunk<
  FetchUserDetailsResponse,
  string,
  { rejectValue: ApiError }
>('contestants/fetchDetails', async (userId, { rejectWithValue }) => {
  try {
    const response = await fetchUserDetails(userId);
    console.log(response)
    return response;
  } catch (error: any) {
    return rejectWithValue({ message: error.message || 'Failed to fetch user details' });
  }
});

const contestantSlice = createSlice({
  name: 'contestants',
  initialState,
  reducers: {
    clearSelectedContestant: (state) => {
      state.selectedContestant = null;
    },
    clearContestants: (state) => {
      state.contestants = [];
      state.totalPages = 0;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContestantsForJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContestantsForJob.fulfilled, (state, action: PayloadAction<FetchUsersResponse>) => {
        state.loading = false;
        state.contestants = action.payload.applicants;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchContestantsForJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'An error occurred';
      })
      .addCase(fetchContestantDetailsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContestantDetailsAsync.fulfilled, (state, action: PayloadAction<FetchUserDetailsResponse>) => {
        state.loading = false;
        state.selectedContestant = action.payload.user;
      })
      .addCase(fetchContestantDetailsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'An error occurred';
      });
  },
});

export const { clearSelectedContestant, clearContestants } = contestantSlice.actions;

export default contestantSlice.reducer;