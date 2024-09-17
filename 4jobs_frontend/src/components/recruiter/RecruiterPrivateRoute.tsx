import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../../redux/store';

interface RecruiterPrivateRouteProps {
  children: React.ReactNode;
}

const RecruiterPrivateRoute: React.FC<RecruiterPrivateRouteProps> = ({ children }) => {
  const { isAuthenticated} = useSelector((state: RootState) => state.recruiter);

  if (!isAuthenticated) {
    return <Navigate to="/recruiter/login" replace />;
  }

 

  return <>{children}</>;
};

export default RecruiterPrivateRoute;
