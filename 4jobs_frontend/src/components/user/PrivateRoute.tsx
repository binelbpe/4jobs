import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { Navigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated && token) {
      // Token exists but not authenticated, logout and redirect
      dispatch(logout());
    }
  }, [isAuthenticated, token, dispatch]);

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
