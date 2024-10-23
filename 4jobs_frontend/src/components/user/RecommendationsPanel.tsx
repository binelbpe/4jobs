import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import RecommendationCard from "./RecommendationCard";
import { RecommendationUser } from "../../types/auth";

interface RecommendationsPanelProps {
  isOpen: boolean;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  isOpen,
}) => {
  const { recommendations, loading, error } = useSelector(
    (state: RootState) => state.connections
  );

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-4">
        <p>Loading recommendations...</p>
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
        <p className="text-red-500 text-center">
          An error occurred while loading recommendations.
        </p>
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
    <div
      className={`bg-white shadow-lg rounded-lg p-4 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } fixed top-16 right-0 h-full z-50 overflow-y-auto lg:static lg:translate-x-0 lg:h-auto`}
    >
      <h3 className="font-semibold text-lg mb-4 text-gray-800">
        Recommendations
      </h3>
      <div className="grid grid-row-1 sm:grid-row-2 lg:grid-row-3 xl:grid-row-4 gap-4">
        {recommendations.map((user: RecommendationUser) => (
          <RecommendationCard
            key={user.id}
            user={user}
            onViewProfile={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPanel;
