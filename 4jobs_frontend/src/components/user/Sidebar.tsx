import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../redux/store";
import { UserCircle } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div
      className={`bg-white shadow-md rounded-lg p-4 w-64 transition-transform duration-300 ease-in-out fixed top-16 left-0 h-full z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:static lg:translate-x-0 lg:block`}
    >
      <div className="flex flex-col items-center mb-4">
        {user?.profileImage ? (
          <img
            src={`${user.profileImage}`}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <UserCircle className="w-16 h-16 text-gray-400" />
        )}
        <h2 className="mt-2 text-xl text-purple-700 font-semibold">
          {user?.name || "Guest"}
        </h2>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-purple-800 mb-1">Bio</h3>
        <p className="text-xs text-purple-700 overflow-hidden text-ellipsis">
          {user?.bio || "No bio available."}
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-purple-600">Profile viewers</span>
          <span className="font-semibold text-purple-600">55</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-purple-600">Post impressions</span>
          <span className="font-semibold text-purple-600">1</span>
        </div>
      </div>

      <Link to="/resume-builder" className="block w-full mt-4">
        <button className="w-full bg-purple-600 text-white py-1 px-2 rounded-full hover:bg-purple-700 transition duration-300 text-xs">
          Build Resume
        </button>
      </Link>
    </div>
  );
};

export default Sidebar;
