import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchRecommendations } from "../../redux/slices/connectionSlice";
import RecommendationCard from "./RecommendationCard";
import ConnectionProfile from "./ConnectionProfile";
import { RecommendationUser } from "../../types/auth";

const Recommendations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { recommendations, loading, error } = useSelector(
    (state: RootState) => state.connections
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchRecommendations(currentUser.id));
    }
  }, [dispatch, currentUser]);

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleCloseProfile = () => {
    setSelectedUserId(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg animate-pulse h-48"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-4">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!Array.isArray(recommendations)) {
    console.error("Recommendations is not an array:", recommendations);
    return (
      <div className="bg-white shadow-lg rounded-lg p-4">
        <p className="text-red-500 text-center">An error occurred while loading recommendations.</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-4">
        <p className="text-gray-500 text-center">
          No recommendations available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
    <h3 className="font-semibold text-lg mb-4 text-gray-800">Recommendations</h3>
    <div className="grid grid-rows-1 sm:grid-rows-2 lg:grid-rows-3 xl:grid-rows-4 gap-4">
        {recommendations.map((user: RecommendationUser) => (
          <RecommendationCard
            key={user.id}
            user={user}
            onViewProfile={handleViewProfile}
          />
        ))}
      </div>
      {selectedUserId && (
        <ConnectionProfile
          userId={selectedUserId}
          onClose={handleCloseProfile}
        />
      )}
    </div>
  );
};

export default Recommendations;