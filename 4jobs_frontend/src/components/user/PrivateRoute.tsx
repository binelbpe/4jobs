import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const token = localStorage.getItem('token');
console.log("token in user",token)
  // Ensure token and Redux authentication state sync correctly
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
