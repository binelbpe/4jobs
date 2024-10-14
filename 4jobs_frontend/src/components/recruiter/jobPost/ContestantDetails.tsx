import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchContestantDetailsAsync, clearSelectedContestant } from '../../../redux/slices/contestantSlice';
import ErrorMessage from '../jobPost/common/ErrorMessage';
import LoadingSpinner from '../jobPost/common/LoadingSpinner';
import { startConversationApi } from '../../../api/recruiterApi';
import RecruiterHeader from '../RecruiterHeader';
import { User, Mail , Phone, Calendar, Award, FileText, ArrowLeft,  Globe } from 'lucide-react';

const ContestantDetails: React.FC = () => {
  const { contestantId } = useParams<{ contestantId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedContestant, loading, error } = useSelector((state: RootState) => state.contestants);
  const recruiterId = useSelector((state: RootState) => state.recruiter.recruiter?.id);
  const handleStartConversation = async () => {
    try {
      await startConversationApi(selectedContestant?.id?selectedContestant?.id:"",recruiterId);
      navigate(`/recruiter/messages`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  useEffect(() => {
    if (contestantId) {
      dispatch(fetchContestantDetailsAsync(contestantId));
    }
    return () => {
      dispatch(clearSelectedContestant());
    };
  }, [dispatch, contestantId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!selectedContestant) return <div>No contestant data available.</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <RecruiterHeader />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-8 text-purple-900 border-b-2 border-purple-200 pb-2">Applicant Profile</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center mb-8">
                {selectedContestant.profileImage ? (
                  <img 
                    src={`${selectedContestant.profileImage}`} 
                    alt={selectedContestant.name} 
                    className="w-32 h-32 rounded-full border-4 border-purple-200 mr-6 mb-4 md:mb-0" 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center mr-6 mb-4 md:mb-0">
                    <User size={48} className="text-purple-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-3xl font-bold text-purple-900 mb-2">{selectedContestant.name}</h3>
                  <div className="flex flex-wrap items-center text-gray-600">
                    <Mail size={16} className="mr-2 text-purple-500" />
                    <span className="mr-4">{selectedContestant.email}</span>
                  </div>
                  <div className="flex flex-wrap items-center text-gray-600">
                    <Phone size={16} className="mr-2 text-purple-500" />
                    <span className="mr-4">{selectedContestant.phone}</span>
                  </div>
                </div>
              </div>

              {(selectedContestant.bio || selectedContestant.about) && (
                <div className="mb-8 bg-purple-50 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-purple-900 mb-3">About Me</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedContestant.bio || selectedContestant.about}</p>
                </div>
              )}

              {selectedContestant.skills && selectedContestant.skills.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-purple-900 mb-3">Skills</h4>
                  <div className="flex flex-wrap">
                    {selectedContestant.skills.map((skill, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 rounded-full px-4 py-2 text-sm font-medium mr-2 mb-2 shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedContestant.experiences && selectedContestant.experiences.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-purple-900 mb-3">Professional Experience</h4>
                  <div className="space-y-6">
                    {selectedContestant.experiences.map((exp) => (
                      <div key={exp.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-lg text-purple-900">{exp.title}</p>
                            <p className="text-purple-700">{exp.company}</p>
                          </div>
                          <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate || 'Present'}</p>
                        </div>
                        <p className="text-gray-700 mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedContestant.projects && selectedContestant.projects.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-purple-900 mb-3">Projects</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedContestant.projects.map((project) => (
                      <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {project.imageUrl && (
                          <img 
                            src={`${project.imageUrl}`} 
                            alt={project.name} 
                            className="w-full h-48 object-cover" 
                          />
                        )}
                        <div className="p-6">
                          <p className="font-semibold text-lg text-purple-900 mb-2">{project.name}</p>
                          <p className="text-gray-700 mb-4">{project.description}</p>
                          {project.link && (
                            <a 
                              href={`${project.link}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-300"
                            >
                              <Globe size={16} className="mr-2" />
                              View Project
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedContestant.certificates && selectedContestant.certificates.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-purple-900 mb-3">Certifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {selectedContestant.certificates.map((cert) => (
                      <div key={cert.id} className="bg-white rounded-lg shadow-md p-6">
                        <Award size={24} className="text-purple-500 mb-2" />
                        <p className="font-semibold text-purple-900">{cert.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {cert.issuingOrganization}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Issued: {new Date(cert.dateOfIssue).toLocaleDateString()}
                        </p>
                        {cert.imageUrl && (
                          <img 
                            src={`${cert.imageUrl}`} 
                            alt={cert.name} 
                            className="mt-2 w-full h-32 object-cover rounded-md" 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {selectedContestant.dateOfBirth && (
                  <div className="flex items-center text-gray-700 bg-gray-100 rounded-lg p-4">
                    <Calendar size={20} className="mr-3 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{new Date(selectedContestant.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {selectedContestant.gender && (
                  <div className="flex items-center text-gray-700 bg-gray-100 rounded-lg p-4">
                    <User size={20} className="mr-3 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{selectedContestant.gender}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedContestant.resume && (
                <div className="mt-8">
                  <a
                    href={`${selectedContestant.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 shadow-md"
                  >
                    <FileText size={20} className="mr-2" />
                    View Full Resume
                  </a>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-8 inline-flex items-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-300 shadow-md"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Applicants
          </button>
          <button
        onClick={handleStartConversation}
        className="mt-4 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition duration-300"
      >
        Start Conversation
      </button>
        </div>
      </div>
    </div>
  );
};

export default ContestantDetails;