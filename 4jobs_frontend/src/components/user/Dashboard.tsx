import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import RecentConnections from './Recent';
import MainFeed from './Main';

const Dashboard: React.FC = () => {
  

  

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
