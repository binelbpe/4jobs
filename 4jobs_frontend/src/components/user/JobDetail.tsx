import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobPost, applyForJobAsync } from "../../redux/slices/authSlice";
import { AppDispatch, RootState } from "../../redux/store";
import Header from "../user/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BasicJobPost } from "../../types/jobPostTypes";
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Calendar,
  Award,
  BookOpen,
  AlertCircle,
} from "lucide-react";

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
  </div>
);

const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const jobDetailsFromState = location.state?.jobDetails;

  const jobPost = useSelector((state: RootState) => {
    if (jobDetailsFromState) return jobDetailsFromState;

    const authJobPost = state.auth.jobPosts.posts.find(
      (job: BasicJobPost) => job._id === jobId
    );
    if (authJobPost) return authJobPost;

    return state.userSearch.jobPosts.find(
      (job: BasicJobPost) => job._id === jobId
    );
  });

  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const error = useSelector((state: RootState) => state.auth.error);

  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!jobPost && jobId) {
      dispatch(fetchJobPost(jobId));
    }
  }, [dispatch, jobId, jobPost]);

  const handleApply = async () => {
    if (jobId && userId) {
      try {
        setApplying(true);
        await dispatch(applyForJobAsync({ userId, jobId })).unwrap();
        toast.success("Successfully applied for the job!");
      } catch (error) {
        console.error("Error applying for job:", error);
        toast.error(
          "Error occurred while applying for the job. Please try again."
        );
      } finally {
        setApplying(false);
      }
    } else {
      console.error("Missing jobId or userId");
      toast.error("Missing jobId or userId");
    }
  };

  if (!jobPost) return <LoadingSpinner />;

  const hasApplied = user?.appliedJobs?.includes(jobPost._id);
  const hasResume = user?.resume;

  const renderApplyButton = () => {
    if (!userId) {
      return (
        <Link
          to="/login"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white font-bold text-lg shadow-md hover:shadow-lg w-full sm:w-auto text-center"
        >
          Login to Apply
        </Link>
      );
    }

    if (!hasResume) {
      return (
        <button
          onClick={() => navigate(`/profile/${userId}`)}
          className="px-6 py-3 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-lg shadow-md hover:shadow-lg w-full sm:w-auto text-center"
        >
          Update Profile to Apply
        </button>
      );
    }

    return (
      <button
        onClick={handleApply}
        disabled={applying || hasApplied}
        className={`px-6 py-3 rounded-full transition-all duration-300 ease-in-out ${
          hasApplied
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : applying
            ? "bg-purple-400"
            : "bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500"
        } text-white font-bold text-lg sm:text-base shadow-md hover:shadow-lg w-full sm:w-auto`}
      >
        {applying
          ? "Applying..."
          : hasApplied
          ? "Already Applied"
          : "Apply Now"}
      </button>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-300 text-white p-6">
            <h1 className="text-3xl font-bold mb-2 md:text-2xl sm:text-xl">
              {jobPost.title}
            </h1>
            <p className="text-xl flex items-center md:text-lg sm:text-base">
              <Briefcase className="mr-2 text-base sm:text-lg" />
              {jobPost.company?.name}
            </p>
          </div>
          <div className="p-6">
            {error && (
              <div
                className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 flex items-center"
                role="alert"
              >
                <AlertCircle className="mr-2" size={20} />
                <p>{error}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Job Details</h2>
                <p className="flex items-center text-base md:text-sm">
                  <MapPin className="mr-2 text-gray-600" size={20} />
                  <span className="font-semibold mr-2">Location:</span>{" "}
                  {jobPost.location}
                </p>
                <p className="flex items-center text-base md:text-sm">
                  <Clock className="mr-2 text-gray-600" size={20} />
                  <span className="font-semibold mr-2">Work Type:</span>{" "}
                  {jobPost.wayOfWork}
                </p>
                <p className="flex items-center text-base md:text-sm">
                  <IndianRupee className="mr-2 text-gray-600" size={20} />
                  <span className="font-semibold mr-2">Salary Range:</span> ₹
                  {jobPost.salaryRange.min} - ₹{jobPost.salaryRange.max}
                </p>
                <p className="flex items-center text-base md:text-sm">
                  <AlertCircle className="mr-2 text-gray-600" size={20} />
                  <span className="font-semibold mr-2">Status:</span>{" "}
                  {jobPost.status}
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Date Information</h2>
                <p className="flex items-center text-base md:text-sm">
                  <Calendar className="mr-2 text-gray-600" size={20} />
                  <span className="font-semibold mr-2">Posted Date:</span>{" "}
                  {new Date(jobPost.createdAt).toLocaleDateString()}
                </p>
                <p className="flex items-center text-base md:text-sm">
                  <Calendar className="mr-2 text-gray-600" size={20} />
                  <span className="font-semibold mr-2">Last Updated:</span>{" "}
                  {new Date(jobPost.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Award className="mr-2 text-purple-600" size={24} />
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {jobPost.description}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <BookOpen className="mr-2 text-purple-600" size={24} />
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {jobPost.skillsRequired.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Award className="mr-2 text-purple-600" size={24} />
                Required Qualifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {jobPost.qualifications.map(
                  (qualification: string, index: number) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {qualification}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              {renderApplyButton()}
            </div>

            {!hasResume && userId && (
              <div className="mt-4 text-center text-red-600">
                Please update your profile and add a resume before applying.
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default JobDetail;
