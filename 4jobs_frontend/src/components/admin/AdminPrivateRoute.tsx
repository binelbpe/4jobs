import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { Navigate, useNavigate } from "react-router-dom";
import { logoutAdmin, refreshAdminToken } from "../../redux/slices/adminSlice";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const AdminPrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticatedAdmin } = useSelector(
    (state: RootState) => state.admin
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const verifyToken = async () => {
      if (!isAuthenticatedAdmin && token) {
        try {
          await dispatch(refreshAdminToken()).unwrap();
        } catch (error) {
          dispatch(logoutAdmin());
          navigate('/admin/login');
        }
      }
    };

    verifyToken();
  }, [isAuthenticatedAdmin, token, dispatch, navigate]);

  if (!isAuthenticatedAdmin && !token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminPrivateRoute;
