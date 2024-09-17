import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/recruiterSlice'; 
import { useNavigate } from 'react-router-dom'; 

const Dashboard: React.FC = () => {
  const { isApproved } = useSelector((state: RootState) => state.recruiter);
  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  const handleLogout = () => {
    dispatch(logout()); 
    navigate('/recruiter/login'); 
  };

  return (
    <div>
      <h1>Recruiter Dashboard</h1>
      {isApproved ? (
        <p>Welcome to your dashboard! Here you can manage your job postings and view analytics.</p>
      ) : (
        <p>Your account is pending approval. Please wait until an admin approves your account.</p>
      )}
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
    </div>
  );
};

export default Dashboard;
