import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const AdminPrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticatedAdmin, token } = useSelector((state: RootState) => state.admin);

  if (isAuthenticatedAdmin || token) {
    return <>{children}</>;
  } else {
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminPrivateRoute;
