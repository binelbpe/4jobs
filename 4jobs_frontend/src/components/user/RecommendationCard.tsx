import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { sendConnectionRequest } from "../../redux/slices/connectionSlice";
import { RecommendationUser } from "../../types/auth";
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecommendationCardProps {
  user: RecommendationUser;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const handleSendRequest = () => {
    if (currentUser) {
      dispatch(
        sendConnectionRequest({
          senderId: currentUser.id,
          recipientId: user.id,
        })
      );
    }
  };

  const getConnectionButton = () => {
    switch (user.connectionStatus) {
      case "pending":
        return (
          <button
            className="w-full text-sm bg-gray-400 text-white px-3 py-2 rounded cursor-not-allowed"
            disabled
          >
            Pending
          </button>
        );
      case "rejected":
        return (
          <button
            onClick={handleSendRequest}
            className="w-full text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded transition duration-300 ease-in-out"
          >
            Connect Again
          </button>
        );
      case "none":
        return (
          <button
            onClick={handleSendRequest}
            className="w-full text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded transition duration-300 ease-in-out"
          >
            Connect
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col justify-between p-4 bg-gray-50 rounded-lg shadow-md hover:bg-gray-100 transition duration-300 ease-in-out h-full">
      <div className="flex flex-col items-center mb-3">
        {user?.profileImage ? (
          <img
            src={`${user.profileImage}`}
            alt={user.name}
            className="rounded-full h-16 w-16 object-cover mb-2"
          />
        ) : (
          <UserCircle className="w-20 h-20 text-gray-400" />
        )}
        <h4 className="font-medium text-base text-gray-800 text-center">
          {user.name}
        </h4>
      </div>
      <div className="flex flex-col space-y-2 mt-auto">
        {getConnectionButton()}
        <button
          onClick={() => navigate(`/connection/profile/${user.id}`)}
          className="w-full text-sm bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 transition duration-300 ease-in-out"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
