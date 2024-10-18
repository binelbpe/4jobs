import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/recruiterSlice';

interface RecruiterPrivateRouteProps {
  children: React.ReactNode;
}

const RecruiterPrivateRoute: React.FC<RecruiterPrivateRouteProps> = ({ children }) => {
  const { isAuthenticatedRecruiter } = useSelector((state: RootState) => state.recruiter);
  const dispatch = useDispatch();
  const token = localStorage.getItem('recruiterToken');

  useEffect(() => {
    if (!isAuthenticatedRecruiter && token) {
      // Token exists but not authenticated, logout and redirect
      dispatch(logout());
    }
  }, [isAuthenticatedRecruiter, token, dispatch]);

  if (!isAuthenticatedRecruiter && !token) {
    return <Navigate to="/recruiter/login" replace />;
  }

  return <>{children}</>;
};

export default RecruiterPrivateRoute;
