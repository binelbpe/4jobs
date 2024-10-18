import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchJobDetails } from '../../redux/slices/jobPostSlice';
import { Briefcase, MapPin, IndianRupee, Clock, ArrowLeft, Users, GraduationCap } from 'lucide-react';
import RecruiterHeader from './RecruiterHeader';

const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedPost, loading, error } = useSelector((state: RootState) => state.jobPosts);

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobDetails(jobId));
    }
  }, [dispatch, jobId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-purple-600">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!selectedPost) {
    return <div className="flex justify-center items-center h-screen text-purple-600">No job details found</div>;
  }

  return (
    <div className="min-h-screen bg-purple-50">
      <RecruiterHeader />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-200"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Job Listings
        </button>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-purple-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">{selectedPost.title}</h1>
            <p className="text-xl">{selectedPost.company?.name}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center">
                <MapPin className="text-purple-600 mr-2" size={20} />
                <span className="text-gray-700">{selectedPost.location}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="text-purple-600 mr-2" size={20} />
                <span className="text-gray-700">{selectedPost.wayOfWork}</span>
              </div>
              <div className="flex items-center">
                <IndianRupee className="text-purple-600 mr-2" size={20} />
                <span className="text-gray-700">₹{selectedPost.salaryRange.min.toLocaleString()} - ₹{selectedPost.salaryRange.max.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="text-purple-600 mr-2" size={20} />
                <span className="text-gray-700">Posted on: {new Date(selectedPost.postedDate || '').toLocaleDateString()}</span>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-purple-800">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{selectedPost.description}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-purple-800">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {selectedPost.skillsRequired.map((skill, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-purple-800">Qualifications</h2>
              <ul className="list-disc list-inside text-gray-700">
                {selectedPost.qualifications.map((qualification, index) => (
                  <li key={index} className="mb-1 flex items-start">
                    <GraduationCap className="text-purple-600 mr-2 mt-1" size={16} />
                    <span>{qualification}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Users className="text-purple-600 mr-2" size={20} />
                <span className="text-gray-700">Applicants: {selectedPost.applicants?.length || 0}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                selectedPost.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {selectedPost.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
