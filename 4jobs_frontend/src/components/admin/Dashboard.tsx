import React, { useEffect } from 'react';
import { Route, Routes,useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminRecruiterList from './AdminRecruiterList'; 
import {  useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import '../../styles/admin/Dashboard.css'; 

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, isAuthenticatedAdmin } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    if (!isAuthenticatedAdmin) {
      navigate('/admin/login');
    }
  }, [isAuthenticatedAdmin, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Routes>
          <Route path="recruiters" element={<AdminRecruiterList />} />
        </Routes>
      </div>
    </div>
  );
};


export default AdminDashboard;
