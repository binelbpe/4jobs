import { Middleware } from '@reduxjs/toolkit';

// Middleware to save recruiter state to localStorage
export const saveRecruiterToLocalStorage: Middleware = storeAPI => next => action => {
  const result = next(action);
  
  const state = storeAPI.getState();
  
  // Save the recruiter state to localStorage
  if (state.recruiter.isAuthenticatedRecruiter) {
    localStorage.setItem('recruiterState', JSON.stringify(state.recruiter));
  } else {
    // Optionally, clear the localStorage if the user logs out or is unauthenticated
    localStorage.removeItem('recruiterState');
  }

  return result;
};
