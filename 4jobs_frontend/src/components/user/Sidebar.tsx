import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="w-1/4 p-4 bg-white shadow-lg mt-4 hidden md:block">
      <div className="flex flex-col items-center">
        {user?.profileImage ? (
          <img
            src={`http://localhost:5000${user.profileImage}`}
            alt="Profile"
            className="h-20 w-20 rounded-full"
          />
        ) : (
          <div className="bg-gray-200 rounded-full h-20 w-20"></div>
        )}
        <h2 className="mt-4 text-lg font-semibold">{user?.name || 'Guest'}</h2>
        <p className="text-gray-500 text-sm text-center mt-2">
          {user?.bio || 'No bio available.'}
        </p>
      </div>
      <div className="mt-6">
        <ul>
          <li className="text-sm text-gray-700 mb-2">
            Profile viewers <span className="text-blue-500">55</span>
          </li>
          <li className="text-sm text-gray-700 mb-2">
            Post impressions <span className="text-blue-500">1</span>
          </li>
        </ul>
        <button className="bg-purple-600 text-white px-3 py-2 rounded-full text-sm w-full">
          Try Premium for free
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
