import React from 'react';

const RightSidebar = () => {
  return (
    <aside className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-purple-600 text-xl font-bold mb-4">Connections</h2>
      <ul className="space-y-3">
        <li className="flex items-center text-gray-700">👤 Connection 1</li>
        <li className="flex items-center text-gray-700">👤 Connection 2</li>
        <li className="flex items-center text-gray-700">👤 Connection 3</li>
        <li className="flex items-center text-gray-700">👤 Connection 4</li>
      </ul>
    </aside>
  );
};

export default RightSidebar;