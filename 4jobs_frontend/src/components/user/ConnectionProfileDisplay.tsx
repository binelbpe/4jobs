import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchConnectionProfile } from "../../redux/slices/connectionSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faBirthdayCake,
  faVenusMars,
} from "@fortawesome/free-solid-svg-icons";
import { UserCircle } from "lucide-react";

interface ConnectionProfileDisplayProps {
  userId: string;
}

const ConnectionProfileDisplay: React.FC<ConnectionProfileDisplayProps> = ({ userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { connectionProfile, loading, error } = useSelector(
    (state: RootState) => state.connections
  );

  useEffect(() => {
    if (userId && (!connectionProfile || connectionProfile.id !== userId)) {
      dispatch(fetchConnectionProfile(userId));
    }
  }, [dispatch, userId, connectionProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">{error}</div>
    );
  }

  if (!connectionProfile) {
    return (
      <div className="text-gray-500 text-center">No profile found</div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-purple-700 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center">
          {connectionProfile?.profileImage ? (
            <img
              src={`${connectionProfile.profileImage}`}
              alt="Profile"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full object-cover mb-2 sm:mb-0 sm:mr-4 border-4 border-white"
            />
          ) : (
            <UserCircle className="w-20 h-20 text-gray-400" />
          )}
          <div className="text-center sm:text-left text-white">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{connectionProfile.name}</h1>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faEnvelope} className="text-purple-500 mr-1 sm:mr-2" />
            <span>{connectionProfile.email}</span>
          </div>
          {connectionProfile.phone && (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faPhone} className="text-purple-500 mr-2" />
              <span>{connectionProfile.phone}</span>
            </div>
          )}
          {connectionProfile.dateOfBirth && (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faBirthdayCake} className="text-purple-500 mr-2" />
              <span>{connectionProfile.dateOfBirth}</span>
            </div>
          )}
          {connectionProfile.gender && (
            <div className="flex items-center">
              <FontAwesomeIcon icon={faVenusMars} className="text-purple-500 mr-2" />
              <span>{connectionProfile.gender}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionProfileDisplay;
