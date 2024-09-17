import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin/Sidebar.css'; 

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <h2>Admin Dashboard</h2>
      <ul>
        <li>
          <Link to="/admin/recruiters">Recruiters</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
