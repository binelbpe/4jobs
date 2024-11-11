import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchAllJobPosts } from "../../redux/slices/jobPostSlice";
import JobList from "./RecruiterJobList";

const MainContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.jobPosts
  );

  useEffect(() => {
    dispatch(fetchAllJobPosts());
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-4 text-purple-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <main className="container mx-auto px-4 py-4 md:py-8 bg-purple-50">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-purple-800">
        Job Listings
      </h2>
      <div className="bg-white shadow-lg rounded-lg p-4 md:p-6">
        {posts.length > 0 ? (
          <JobList jobs={posts} />
        ) : (
          <p className="text-center text-purple-600 text-sm md:text-base">
            No job postings available at the moment.
          </p>
        )}
      </div>
    </main>
  );
};

export default MainContent;
