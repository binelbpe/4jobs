import { Middleware } from '@reduxjs/toolkit';

export const saveRecruiterToLocalStorage: Middleware = storeAPI => next => action => {
  const result = next(action);
  
  const state = storeAPI.getState();

  if (state.recruiter.isAuthenticatedRecruiter) {
    localStorage.setItem('recruiterState', JSON.stringify(state.recruiter));
  } else {
    localStorage.removeItem('recruiterState');
  }

  return result;
};
