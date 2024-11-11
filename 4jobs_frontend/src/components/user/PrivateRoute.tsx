import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { Navigate, useNavigate } from "react-router-dom";
import { logout, refreshToken } from "../../redux/slices/authSlice";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!isAuthenticated && token) {
        try {
          await dispatch(refreshToken()).unwrap();
        } catch (error) {
          dispatch(logout());
          navigate("/login");
        }
      }
    };

    verifyToken();
  }, [isAuthenticated, token, dispatch, navigate]);

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
