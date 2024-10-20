import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ResumeData } from '../../types/resumeTypes';

interface ResumeState {
  resumeData: ResumeData | null;
  generatedResumeLink: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  resumeData: null,
  generatedResumeLink: null,
  loading: false,
  error: null,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setResumeData: (state, action: PayloadAction<ResumeData>) => {
      state.resumeData = action.payload;
    },
    generateResumeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    generateResumeSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.generatedResumeLink = action.payload;
    },
    generateResumeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearResumeData: (state) => {
      state.resumeData = null;
      state.generatedResumeLink = null;
      state.error = null;
    },
  },
});

export const {
  setResumeData,
  generateResumeStart,
  generateResumeSuccess,
  generateResumeFailure,
  clearResumeData,
} = resumeSlice.actions;

export default resumeSlice.reducer;
