import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchConnectionProfile } from "../../redux/slices/connectionSlice";
import { User } from "../../types/auth";
import { UserCircle } from 'lucide-react';

interface ConnectionProfileProps {
  userId: string;
  onClose: () => void;
}

const ConnectionProfile: React.FC<ConnectionProfileProps> = ({ userId, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { connectionProfile, loading, error } = useSelector((state: RootState) => state.connections);

  useEffect(() => {
    dispatch(fetchConnectionProfile(userId));
  }, [dispatch, userId]);

  if (loading) {
    return <div className="text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!connectionProfile) {
    return <div className="text-center">No profile data available.</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Connection Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="flex items-center mb-4">
          {connectionProfile.profileImage ? (
            <img src={connectionProfile.profileImage} alt={connectionProfile.name} className="rounded-full h-20 w-20 object-cover mr-4"/>
          ) : (
            <UserCircle className="w-20 h-20 text-gray-400 mr-4" />
          )}
          <div>
            <h3 className="text-xl font-semibold">{connectionProfile.name}</h3>
            <p className="text-gray-600">{connectionProfile.email}</p>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Bio</h4>
          <p>{connectionProfile.bio || "No bio available."}</p>
        </div>
        {/* Add more sections for skills, experience, etc. as needed */}
      </div>
    </div>
  );
};

export default ConnectionProfile;