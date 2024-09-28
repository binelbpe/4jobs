import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const AdminPrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticatedAdmin } = useSelector((state: RootState) => state.admin);
  const token = localStorage.getItem('adminToken');

  if (isAuthenticatedAdmin || token) {
    return <>{children}</>;
  } else {
    return <Navigate to="/admin/login" replace />;
  }
};

export default AdminPrivateRoute;
