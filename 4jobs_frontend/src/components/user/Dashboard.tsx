import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchRecommendations } from "../../redux/slices/connectionSlice";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainFeed from "./Main";
import RecommendationsPanel from "./RecommendationsPanel";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleRecommendations = () => {
    setIsRecommendationsOpen(!isRecommendationsOpen);
  };

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchRecommendations(currentUser.id));
    }
  }, [dispatch, currentUser]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto m-3 px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row gap-5">
          <div
            className={`lg:hidden fixed top-1/2 left-0 transform -translate-y-1/2 w-16 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300`}
            onClick={toggleSidebar}
          >
            <ChevronLeft className="text-gray-600" />
          </div>

          <div className={`hidden lg:block lg:w-1/4 xl:w-1/5`}>
            <div className="sticky top-20">
              <Sidebar isOpen={true} />
            </div>
          </div>

          <div className="w-full lg:w-1/2 xl:w-3/5">
            <MainFeed />
          </div>

          <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
            <div className="sticky top-20">
              <RecommendationsPanel isOpen={true} />
            </div>
          </div>

          <div
            className={`lg:hidden transition-transform duration-300 ease-in-out ${
              isRecommendationsOpen ? "block" : "hidden"
            }`}
          >
            <RecommendationsPanel isOpen={isRecommendationsOpen} />
          </div>

          <div
            className={`lg:hidden fixed top-1/2 right-0 transform -translate-y-1/2 w-16 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300`}
            onClick={toggleRecommendations}
          >
            <ChevronRight className="text-gray-600" />
          </div>

          <div
            className={`lg:hidden transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "block" : "hidden"
            }`}
          >
            <Sidebar isOpen={isSidebarOpen} />
          </div>

          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black opacity-50 z-40"
              onClick={toggleSidebar}
            />
          )}

          {isRecommendationsOpen && (
            <div
              className="fixed inset-0 bg-black opacity-50 z-40"
              onClick={toggleRecommendations}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
