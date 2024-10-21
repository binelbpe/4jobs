// slices/contestantSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserDetails, FetchUsersResponse, FetchUserDetailsResponse, ApiError } from '../../types/auth';
import { fetchJobApplicants, fetchUserDetails, fetchFilteredApplicants } from '../../api/recruiterApi';

interface ContestantState {
  contestants: User[];
  filteredContestants: (User & { matchPercentage?: number })[];
  selectedContestant: UserDetails | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: ContestantState = {
  contestants: [],
  filteredContestants: [],
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

interface FilteredUserResponse extends Omit<FetchUsersResponse, 'applicants'> {
  applicants: (User & { matchPercentage?: number })[];
}

export const fetchFilteredContestantsForJob = createAsyncThunk<
  FilteredUserResponse,
  string,
  { rejectValue: ApiError }
>('contestants/fetchFilteredContestantsForJob', async (jobId, { rejectWithValue }) => {
  try {
    const response = await fetchFilteredApplicants(jobId);
    console.log('Filtered Response:', response);
    // Ensure that each applicant has a matchPercentage property
    const filteredResponse: FilteredUserResponse = {
      applicants: Array.isArray(response) 
        ? response.map(applicant => ({
            ...applicant,
            matchPercentage: (applicant as any).matchPercentage || 0
          }))
        : [{
            ...response,
            matchPercentage: (response as any).matchPercentage || 0
          }],
      totalPages: (response as FetchUsersResponse).totalPages || 1,
      currentPage: (response as FetchUsersResponse).currentPage || 1
    };
    console.log('Processed Filtered Response:', filteredResponse);
    return filteredResponse;
  } catch (error) {
    return rejectWithValue({ message: error instanceof Error ? error.message : 'Failed to fetch filtered contestants' });
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
      })
      .addCase(fetchFilteredContestantsForJob.fulfilled, (state, action: PayloadAction<FilteredUserResponse>) => {
        state.filteredContestants = action.payload.applicants;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
        state.loading = false;
      });
  },
});

export const { clearSelectedContestant, clearContestants } = contestantSlice.actions;

export default contestantSlice.reducer;
