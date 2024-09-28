import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  fetchContestantsForJob,
  clearContestants,
} from "../../../redux/slices/contestantSlice";
import { User, Mail, Eye , FileText } from "lucide-react";
import Pagination from "../jobPost/common/agination";
import ErrorMessage from "../jobPost/common/ErrorMessage";
import LoadingSpinner from "../jobPost/common/LoadingSpinner";
import RecruiterHeader from "../RecruiterHeader";

const JobContestantsList: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    contestants = [],
    loading,
    error,
    totalPages,
    currentPage,
  } = useSelector((state: RootState) => state.contestants);

  const [page, setPage] = useState(1);

  useEffect(() => {
    if (jobId) {
      dispatch(fetchContestantsForJob({ jobId, page }));
    }
    return () => {
      dispatch(clearContestants());
    };
  }, [dispatch, jobId, page]);

  const handleViewContestant = (contestantId: string) => {
    navigate(`/recruiter/contestant/${contestantId}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-gray-100 min-h-screen">
      <RecruiterHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <h2 className="text-3xl font-bold mb-6 text-purple-800">
          Job Applicants
        </h2>
        {Array.isArray(contestants) && contestants.length === 0 ? (
          <p className="text-center text-gray-600">
            No applicants for this job post yet.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contestants.map((contestant) => (
                <div
                  key={contestant.id}
                  className="bg-white border border-purple-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    {contestant.profileImage ? (
                      <img
                        src={`http://localhost:5000${contestant.profileImage}`}
                        alt={contestant.name}
                        className="w-16 h-16 rounded-full mr-4 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center mr-4">
                        <User size={32} className="text-purple-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-purple-800">
                        {contestant.name}
                      </h3>
                      <div className="flex items-center text-gray-600">
                        <Mail size={14} className="mr-1" />
                        <span>{contestant.email}</span>
                      </div>

                      <div className="flex items-center text-gray-600 mt-2">
                        <FileText size={14} className="mr-1" />
                        {contestant?.resume ? (
                          <a
                            href={`http://localhost:5000${contestant.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="text-purple-600 hover:underline"
                          >
                            Download Resume
                          </a>
                        ) : (
                          <span>No resume uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewContestant(contestant.id)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300 flex items-center justify-center"
                  >
                    <Eye size={18} className="mr-2" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobContestantsList;
