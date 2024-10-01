import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  fetchJobPostsAsync,
  applyForJobAsync,
  fetchJobPost,
  reportJobAsync,
} from "../../redux/slices/authSlice";
import { BasicJobPost } from "../../types/jobPostTypes";
import Header from "../user/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Building2, MapPin, Calendar, Flag } from "lucide-react";

const JobList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { jobPosts, user } = useSelector((state: RootState) => state.auth);
  const { posts, loading, error, totalPages, totalCount, currentPage } =
    jobPosts;
  const appliedJobs = user?.appliedJobs || [];

  const [page, setPage] = useState(currentPage);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filter, setFilter] = useState({});

  useEffect(() => {
    dispatch(fetchJobPostsAsync({ page, limit, sortBy, sortOrder, filter }));
  }, [dispatch, page, limit, sortBy, sortOrder, filter]);

  const handleApply = async (jobId: string) => {
    if (user?.id) {
      try {
        const resultAction = await dispatch(
          applyForJobAsync({ userId: user.id, jobId })
        );

        if (applyForJobAsync.fulfilled.match(resultAction)) {
          toast.success("Successfully applied for the job!", {
            position: "top-right",
            autoClose: 3000,
          });

          dispatch(
            fetchJobPostsAsync({ page, limit, sortBy, sortOrder, filter })
          );
        } else if (applyForJobAsync.rejected.match(resultAction)) {
          toast.error(resultAction.payload as string, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (err) {
        toast.error("Error occurred while applying.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      toast.error("User ID not found. Please log in.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleReport = async (jobId: string) => {
    if (user?.id) {
      try {
        const resultAction = await dispatch(reportJobAsync({ userId: user.id, jobId }));
    
        if (reportJobAsync.fulfilled.match(resultAction)) {
          toast.success('Job reported successfully', {
            position: "top-right",
            autoClose: 3000,
          });
        } else if (reportJobAsync.rejected.match(resultAction)) {
          toast.error(resultAction.payload as string, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (err) {
        toast.error('Error occurred while reporting the job.', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      toast.error('User ID not found. Please log in.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleViewDetails = async (jobId: string) => {
    try {
      await dispatch(fetchJobPost(jobId));
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      toast.error("Error fetching job details. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleFilterChange = (newFilter: object) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  if (error) return <div className="text-center text-red-600 p-4">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <ToastContainer />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Job Listings</h1>

        <div className="mb-6 flex flex-wrap gap-4">
          <select
            onChange={(e) => handleSortChange(e.target.value)}
            value={sortBy}
            className="bg-white border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            <option value="createdAt">Date Posted</option>
            <option value="title">Job Title</option>
            <option value="company.name">Company Name</option>
          </select>
          <select
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            value={limit}
            className="bg-white border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
          <button
            onClick={() => handleFilterChange({})}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
          >
            Clear Filters
          </button>
        </div>

        <div className="space-y-6">
          {error && <p className="mb-4 text-red-500">{error}</p>}
          {posts.map((job: BasicJobPost) => (
            <div
              key={job._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 md:mb-0">
                    {job.title}
                  </h2>
                  <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {job.wayOfWork}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-600">
                    <Building2 className="w-5 h-5 mr-2 text-gray-400" />
                    {job.company.name}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                    {job.location}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <button
                    onClick={() => handleViewDetails(job._id)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 w-full sm:w-auto text-center mb-2 sm:mb-0"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleApply(job._id)}
                    className={`px-6 py-2 rounded-md transition-colors w-full sm:w-auto ${
                      appliedJobs?.includes(job._id)
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
                    }`}
                    disabled={appliedJobs?.includes(job._id)}
                  >
                    {appliedJobs?.includes(job._id) ? "Applied" : "Apply Now"}
                  </button>
                  <button
                  onClick={() => handleReport(job._id)}
                  className="ml-2 text-red-500 hover:text-red-600 focus:outline-none"
                  title="Report Job"
                >
                  <Flag size={20} />
                </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`mx-1 px-4 py-2 rounded-md ${
                  pageNum === page
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                } transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50`}
              >
                {pageNum}
              </button>
            )
          )}
        </div>

        <p className="mt-6 text-center text-gray-600">
          Total Jobs: {totalCount}
        </p>
      </div>
    </div>
  );
};

export default JobList;
