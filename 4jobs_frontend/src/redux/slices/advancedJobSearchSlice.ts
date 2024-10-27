import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { JobSearchState, JobSearchFilters } from '../../types/jobSearchTypes';
import { advancedJobSearchApi } from '../../api/authapi';

const initialState: JobSearchState = {
  filters: {},
  exactMatches: [],
  similarMatches: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  totalExactCount: 0,
  totalSimilarCount: 0
};

export const performAdvancedJobSearch = createAsyncThunk(
  'advancedJobSearch/search',
  async ({ 
    filters, 
    page = 1, 
    limit = 10 
  }: { 
    filters: JobSearchFilters, 
    page?: number, 
    limit?: number 
  }, { rejectWithValue }) => {
    try {
      const response = await advancedJobSearchApi(filters, page, limit);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const advancedJobSearchSlice = createSlice({
  name: 'advancedJobSearch',
  initialState,
  reducers: {
    setAdvancedFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearAdvancedFilters: (state) => {
      state.filters = {};
      state.exactMatches = [];
      state.similarMatches = [];
      state.totalPages = 1;
      state.currentPage = 1;
      state.totalExactCount = 0;
      state.totalSimilarCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(performAdvancedJobSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performAdvancedJobSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.exactMatches = action.payload.exactMatches;
        state.similarMatches = action.payload.similarMatches;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalExactCount = action.payload.totalExactCount;
        state.totalSimilarCount = action.payload.totalSimilarCount;
      })
      .addCase(performAdvancedJobSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setAdvancedFilters, clearAdvancedFilters } = advancedJobSearchSlice.actions;
export default advancedJobSearchSlice.reducer;
