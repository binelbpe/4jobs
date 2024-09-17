import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminRecruiterList from './AdminRecruiterList'; 
import '../../styles/admin/Dashboard.css'; 

const AdminDashboard: React.FC = () => {
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
