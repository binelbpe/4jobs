import React from 'react';

const MainContent = () => {
  return (
    <main>
      <div className="bg-white p-4 shadow-md rounded-lg mb-3">
        <img src="https://via.placeholder.com/500" alt="Post" className="w-full rounded-lg" />
        <p className="text-gray-500 mt-4">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>
        <button className="text-purple-600 mt-4">Share</button>
      </div>
    </main>
  );
};

export default MainContent;
