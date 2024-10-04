import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchConnectionProfile } from '../../redux/slices/connectionSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faEnvelope, faPhone, faBirthdayCake, faVenusMars, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { UserCircle } from 'lucide-react';
import Header from './Header'


const ConnectionProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { connectionProfile, loading, error } = useSelector((state: RootState) => state.connections);

  useEffect(() => {
    if (userId) {
      dispatch(fetchConnectionProfile(userId));
    }
  }, [dispatch, userId]);

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center m-3 items-center h-screen bg-gray-100">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </>
    );
  }

  if (!connectionProfile) {
    return (
      <>
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="text-gray-500 text-xl">No profile found</div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <button onClick={handleClose} className="mb-4 flex items-center text-purple-700 hover:text-purple-900">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-purple-700 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center">

            {connectionProfile?.profileImage ? (
          <img
          src={`${connectionProfile.profileImage}`}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mb-4 sm:mb-0 sm:mr-6 border-4 border-white"
          />
        ) : (
          <UserCircle className="w-20 h-20 text-gray-400" />
        )}
              <div className="text-center sm:text-left text-white">
                <h1 className="text-3xl font-bold">{connectionProfile.name}</h1>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="text-purple-500 mr-2" />
                <span>{connectionProfile.email}</span>
              </div>
              {connectionProfile.phone && (
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faPhone} className="text-purple-500 mr-2" />
                  <span>{connectionProfile.phone}</span>
                </div>
              )}
              {connectionProfile.dateOfBirth && (
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faBirthdayCake} className="text-purple-500 mr-2" />
                  <span>{connectionProfile.dateOfBirth}</span>
                </div>
              )}
              {connectionProfile.gender && (
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faVenusMars} className="text-purple-500 mr-2" />
                  <span>{connectionProfile.gender}</span>
                </div>
              )}
            </div>

            {connectionProfile.bio && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">Bio</h2>
                <p className="text-gray-700">{connectionProfile.bio}</p>
              </div>
            )}

            {connectionProfile.about && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">About</h2>
                <p className="text-gray-700">{connectionProfile.about}</p>
              </div>
            )}

            {connectionProfile.skills && connectionProfile.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {connectionProfile.skills.map((skill, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {connectionProfile.experiences && connectionProfile.experiences.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">Experiences</h2>
                {connectionProfile.experiences.map((exp, index) => (
                  <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-700">{exp.title}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</p>
                  </div>
                ))}
              </div>
            )}

            {connectionProfile.resume && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">Resume</h2>
                <a href={connectionProfile.resume} target="_blank" rel="noopener noreferrer" className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300">
                  View Resume
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionProfile;