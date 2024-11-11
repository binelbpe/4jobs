import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { PencilIcon, UserCircle } from "lucide-react";
import { RootState } from "../../../redux/store";

const CreatePostButton: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 text-xs sm:text-sm md:text-base">
      <Link to="/posts/create" className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          {user?.profileImage ? (
            <img
              src={`${user?.profileImage}`}
              alt="User avatar"
              className="rounded-full"
            />
          ) : (
            <UserCircle className="w-20 h-20 text-gray-400" />
          )}
        </div>
        <div className="flex-grow">
          <div className="bg-purple-50 text-purple-500 rounded-full py-1 px-2 text-xs sm:text-sm md:text-base">
            Write about something
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="text-purple-500 hover:bg-purple-100 rounded-full p-1 transition duration-300 text-xs sm:text-sm md:text-base">
            <PencilIcon size={20} />
          </button>
          <button className="text-purple-500 hover:bg-purple-100 rounded-full p-1 transition duration-300 text-xs sm:text-sm md:text-base">
            <svg
              xmlns="http://www.w3.org/2000/s"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            />
          </button>
        </div>
      </Link>
    </div>
  );
};

export default CreatePostButton;
