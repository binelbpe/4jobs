import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { Navigate } from 'react-router-dom';
import { logoutAdmin, setLogoutAdmin } from '../../redux/slices/adminSlice';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const AdminPrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticatedAdmin } = useSelector((state: RootState) => state.admin);
  const dispatch = useDispatch<AppDispatch>();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!isAuthenticatedAdmin && token) {
      // Token exists but not authenticated, logoutAdmin and redirect
      dispatch(setLogoutAdmin());
      dispatch(logoutAdmin());
    }
  }, [isAuthenticatedAdmin, token, dispatch]);

  if (!isAuthenticatedAdmin && !token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminPrivateRoute;
