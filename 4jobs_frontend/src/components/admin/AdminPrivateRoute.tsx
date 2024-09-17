import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const AdminPrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.admin);

  if (isAuthenticated || token) {
    return <>{children}</>;
  } else {
     return <Navigate to="/admin/login" replace />;
  }
};

export default AdminPrivateRoute;
