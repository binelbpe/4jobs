import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../redux/store';
import { logout, refreshRecruiterToken } from '../../redux/slices/recruiterSlice';

interface RecruiterPrivateRouteProps {
  children: React.ReactNode;
}

const RecruiterPrivateRoute: React.FC<RecruiterPrivateRouteProps> = ({ children }) => {
  const { isAuthenticatedRecruiter } = useSelector((state: RootState) => state.recruiter);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const token = localStorage.getItem('recruiterToken');

  useEffect(() => {
    const verifyToken = async () => {
      if (!isAuthenticatedRecruiter && token) {
        try {
          await dispatch(refreshRecruiterToken()).unwrap();
        } catch (error) {
          dispatch(logout());
          navigate('/recruiter/login');
        }
      }
    };

    verifyToken();
  }, [isAuthenticatedRecruiter, token, dispatch, navigate]);

  if (!isAuthenticatedRecruiter && !token) {
    return <Navigate to="/recruiter/login" replace />;
  }

  return <>{children}</>;
};

export default RecruiterPrivateRoute;
