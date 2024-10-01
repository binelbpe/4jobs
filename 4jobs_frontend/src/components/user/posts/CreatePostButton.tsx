import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PencilIcon,UserCircle } from 'lucide-react';
import { RootState } from '../../../redux/store';


const CreatePostButton: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <Link to="/posts/create" className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
         {user?.profileImage?( <img src={`${user?.profileImage}`} alt="User avatar" className="rounded-full" />): (
          <UserCircle className="w-20 h-20 text-gray-400" />
        )}
        </div>
        <div className="flex-grow">
          <div className="bg-purple-50 text-purple-500 rounded-full py-2 px-4">
            Write about something
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="text-purple-500 hover:bg-purple-100 rounded-full p-2 transition duration-300">
            <PencilIcon size={20} />
          </button>
          <button className="text-purple-500 hover:bg-purple-100 rounded-full p-2 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/s" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </Link>
    </div>
  );
};

export default CreatePostButton;