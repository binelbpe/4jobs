import React from 'react';

const RecentConnections = () => {
  const connections = ['connection1', 'connection', 'connection', 'connection', 'connection'];

  return (
    <div className="w-1/4 p-4 bg-white shadow-lg mt-4 hidden md:block">
      <h3 className="font-semibold mb-4">Recent Connections</h3>
      {connections.map((connection, index) => (
        <div key={index} className="flex items-center space-x-2 mb-3">
          <div className="bg-gray-200 rounded-full h-8 w-8"></div>
          <span>{connection}</span>
        </div>
      ))}
    </div>
  );
};

export default RecentConnections;
