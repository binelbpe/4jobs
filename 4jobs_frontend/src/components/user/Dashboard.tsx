import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import Header from './Header';
import Sidebar from './Sidebar';
import RecentConnections from './Recent';
import MainFeed from './Main';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex m-3">
        <Sidebar />
        <MainFeed />
        <RecentConnections />
      </div>
    </div>
  );
};

export default Dashboard;
