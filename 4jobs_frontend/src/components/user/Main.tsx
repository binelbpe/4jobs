import React from 'react';
import { FaThumbsUp, FaCommentAlt, FaShare, FaPaperPlane } from 'react-icons/fa'; // Importing icons from react-icons

const MainFeed = () => {
  return (
    <div className="w-full md:w-3/4 p-4">
      {/* Post something section */}
      <div className="bg-white shadow-md rounded-md p-4 mb-6">
        <div className="flex space-x-4 items-center">
          <div className="bg-gray-200 rounded-full h-12 w-12"></div>
          <input
            type="text"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-full"
            placeholder="Post something..."
          />
          <button className="text-gray-500">Media..</button>
          <button className="text-gray-500">Write article..</button>
        </div>
      </div>

      {/* Promoted Ad section */}
      <div className="bg-white shadow-md rounded-md p-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Apple</span>
          <span className="text-gray-400 text-sm">Promoted</span>
        </div>
        <h3 className="font-semibold text-lg mt-4">Up to 18 hours of battery life</h3>
        <img
          src="https://via.placeholder.com/728x400"
          alt="Ad"
          className="w-full mt-4"
        />
        <p className="text-gray-400 mt-2 text-sm">
          Battery life varies by model, use, and configuration.
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 text-blue-500">
              <FaThumbsUp className="h-4 w-4" />
             
            </button>
            <button className="flex items-center space-x-2 text-blue-500">
              <FaCommentAlt className="h-4 w-4" />
              
            </button>
            <button className="flex items-center space-x-2 text-blue-500">
              <FaShare className="h-4 w-4" />
              
            </button>
            <button className="flex items-center space-x-2 text-blue-500">
              <FaPaperPlane className="h-4 w-4" />
              
            </button>
          </div>
          <div className="text-gray-500 text-sm">254 likes</div>
        </div>
      </div>
    </div>
  );
};

export default MainFeed;
