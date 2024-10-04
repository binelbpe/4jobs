import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Recommendations from './Recommendations';
import MainFeed from './Main';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto m-3 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-5">
          
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
            <div className="sticky top-20">
              <Sidebar />
            </div>
          </div>

 
          <div className="w-full lg:w-1/2 xl:w-3/5">
            <MainFeed />
          </div>

          <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
            <div className="sticky top-20">
              <Recommendations />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;