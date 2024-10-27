import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { fetchProfile, selectRecruiter } from '../../redux/slices/recruiterSlice';
import { useNavigate } from 'react-router-dom';
import RecruiterHeader from '../recruiter/RecruiterHeader';

const RecruiterProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { profile, loading, error, recruiter } = useSelector(selectRecruiter);
  const navigate = useNavigate();

  useEffect(() => {
    if (recruiter?.id) {
      dispatch(fetchProfile(recruiter.id));
    }
  }, [dispatch, recruiter]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4">Error: {error}</div>;

  return (
    <>
      <RecruiterHeader />
      <div className="max-w-4xl mx-auto p-6 lg:p-8 bg-white shadow-lg rounded-lg mt-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">Recruiter Profile</h1>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>Name:</strong> {profile?.name}</div>
            <div><strong>Email:</strong> {profile?.email}</div>
            <div><strong>Company Name:</strong> {profile?.companyName}</div>
            <div><strong>Company Location:</strong> {profile?.location}</div>
            <div><strong>Phone:</strong> {profile?.phone}</div>
          </div>

          {profile?.governmentId && (
            <div>
              <p><strong>Government ID:</strong></p>
              <img src={`${profile.governmentId}`} alt="Government ID" className="w-24 h-auto border border-gray-300 rounded" />
            </div>
          )}

          {profile?.employeeIdImage && (
            <div>
              <p><strong>Employee ID Image:</strong></p>
              <img src={`${profile.employeeIdImage}`} alt="Employee ID" className="w-24 h-auto border border-gray-300 rounded" />
            </div>
          )}

          <button 
            onClick={() => navigate('/recruiter/update-profile')} 
            className="mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300 w-full">
            Update Profile
          </button>
        </div>
      </div>
    </>
  );
};

export default RecruiterProfile;
