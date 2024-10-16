import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { sendConnectionRequest } from "../../redux/slices/connectionSlice";
import { applyForJobAsync, fetchJobPost } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { User } from "../../types/auth";
import { BasicJobPost } from "../../types/jobPostTypes";
import Header from "./Header";
import { UserCircle, Briefcase } from "lucide-react";
import { toast } from "react-toastify";

const SearchResults: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { users, jobPosts, loading, error } = useSelector(
    (state: RootState) => state.userSearch
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const handleSendRequest = async (recipientId: string) => {
    if (currentUser) {
      try {
        await dispatch(
          sendConnectionRequest({ senderId: currentUser.id, recipientId })
        ).unwrap();
        setSentRequests((prev) => [...prev, recipientId]);
        toast.success("Connection request sent successfully!");
      } catch (error) {
        console.error("Error sending connection request:", error);
        toast.error("Failed to send connection request. Please try again.");
      }
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/connection/profile/${userId}`);
  };

  const handleApplyJob = async (jobId: string) => {
    if (!jobId) {
      console.error("Invalid job ID");
      toast.error("Error: Invalid job ID");
      return;
    }

    if (currentUser) {
      try {
        console.log("Applying for job with ID:", jobId);
        await dispatch(
          applyForJobAsync({ userId: currentUser.id, jobId })
        ).unwrap();
        setAppliedJobs((prev) => [...prev, jobId]);
        toast.success("Successfully applied for the job!");
      } catch (error) {
        console.error("Error applying for job:", error);
        toast.error(
          "Error occurred while applying for the job. Please try again."
        );
      }
    }
  };

  const handleViewJob = async (jobId: string) => {
    if (!jobId) {
      console.error("Invalid job ID");
      toast.error("Error: Invalid job ID");
      return;
    }

    try {
      console.log("Fetching job details for ID:", jobId);
      await dispatch(fetchJobPost(jobId)).unwrap();
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Error occurred while fetching job details. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">
          Search Results
        </h2>

        {users.length === 0 && jobPosts.length === 0 && (
          <p className="text-gray-500 text-center">No results found</p>
        )}

        {users.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-purple-600">
              Users
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user: User) => (
                <div
                  key={user.id}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex items-center mb-4">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                    ) : (
                      <UserCircle className="w-12 h-12 text-gray-400 mr-4" />
                    )}
                    <div>
                      <h4 className="font-semibold">{user.name}</h4>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {user.isConnected === false &&
                      !sentRequests.includes(user.id) && (
                        <button
                          onClick={() => handleSendRequest(user.id)}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition duration-300"
                        >
                          Connect
                        </button>
                      )}
                    {sentRequests.includes(user.id) && (
                      <button
                        className="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed"
                        disabled
                      >
                        Request Sent
                      </button>
                    )}
                    <button
                      onClick={() => handleViewProfile(user.id)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition duration-300"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {jobPosts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-purple-600">
              Job Posts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobPosts.map((job: BasicJobPost) => (
                <div
                  key={job._id}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex items-center mb-4">
                    <Briefcase className="w-8 h-8 text-purple-600 mr-4" />
                    <div>
                      <h4 className="font-semibold">{job.title}</h4>
                      <p className="text-sm text-gray-500">
                        {job.company?.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {job.description.substring(0, 100)}...
                  </p>
                  <div className="flex space-x-2">
                    {job.isApplied || appliedJobs.includes(job._id) ? (
                      <button
                        className="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed"
                        disabled
                      >
                        Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplyJob(job._id)}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition duration-300"
                      >
                        Apply
                      </button>
                    )}
                    <button
                      onClick={() => handleViewJob(job._id)}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition duration-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
