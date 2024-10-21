import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { BasicJobPost } from '../../types/jobPostTypes';
import RecruiterHeader from './RecruiterHeader';
import { ArrowLeft, Briefcase, MapPin, IndianRupee, Users, Calendar, Clock, Globe, FileCheck } from 'lucide-react';

const RecruiterJobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { posts } = useSelector((state: RootState) => state.jobPosts);
  const [jobPost, setJobPost] = useState<BasicJobPost | null>(null);

  useEffect(() => {
    const post = posts.find(p => p._id === jobId);
    if (post) {
      setJobPost(post);
    } else {
      navigate('/recruiter/jobs');
    }
  }, [jobId, posts, navigate]);

  if (!jobPost) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <RecruiterHeader />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="mb-4 flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Job Posts
        </button>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-4 text-purple-800">{jobPost.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center">
              <Briefcase className="text-purple-600 mr-2" />
              <span className="font-semibold">Company:</span>
              <span className="ml-2">{jobPost.company?.name}</span>
            </div>
            <div className="flex items-center">
              <Globe className="text-purple-600 mr-2" />
              <span className="font-semibold">Website:</span>
              <a href={jobPost.company?.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                {jobPost.company?.website}
              </a>
            </div>
            <div className="flex items-center">
              <MapPin className="text-purple-600 mr-2" />
              <span className="font-semibold">Location:</span>
              <span className="ml-2">{jobPost.location}</span>
            </div>
            <div className="flex items-center">
              <IndianRupee className="text-purple-600 mr-2" />
              <span className="font-semibold">Salary Range:</span>
              <span className="ml-2">₹{jobPost.salaryRange.min.toLocaleString()} - ₹{jobPost.salaryRange.max.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <Users className="text-purple-600 mr-2" />
              <span className="font-semibold">Way of Work:</span>
              <span className="ml-2">{jobPost.wayOfWork}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="text-purple-600 mr-2" />
              <span className="font-semibold">Posted On:</span>
              <span className="ml-2">{new Date(jobPost.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="text-purple-600 mr-2" />
              <span className="font-semibold">Status:</span>
              <span className={`ml-2 ${jobPost.status === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                {jobPost.status}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="text-purple-600 mr-2" />
              <span className="font-semibold">Applicants:</span>
              <span className="ml-2">{jobPost.applicants?.length || 0}</span>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-purple-700">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{jobPost.description}</p>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-purple-700">Qualifications</h3>
            <ul className="list-disc list-inside text-gray-700">
              {jobPost.qualifications?.filter(q => q).map((qualification, index) => (
                <li key={index}>{qualification}</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-purple-700">Skills Required</h3>
            <div className="flex flex-wrap gap-2">
              {jobPost.skillsRequired?.filter(s => s).map((skill, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          {jobPost.reports && jobPost.reports.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-red-700">Reports</h3>
              {jobPost.reports.map((report, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                  <p><strong>Reason:</strong> {report.reason}</p>
                  <p><strong>Reported on:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterJobDetails;
