import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { updateProfile, selectRecruiter } from '../../redux/slices/recruiterSlice';
import { useNavigate } from 'react-router-dom';
import RecruiterHeader from '../recruiter/RecruiterHeader'; // Adjust the path if needed

const RecruiterProfileUpdate: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { profile, recruiter } = useSelector(selectRecruiter);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    companyName: profile?.companyName || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    governmentId: null,
    employeeIdImage: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = new FormData();
    
    updatedData.append('name', formData.name);
    updatedData.append('email', formData.email);
    updatedData.append('companyName', formData.companyName);
    updatedData.append('phone', formData.phone);
    updatedData.append('location', formData.location);

    if (formData.governmentId) updatedData.append('governmentId', formData.governmentId);
    if (formData.employeeIdImage) updatedData.append('employeeIdImage', formData.employeeIdImage);

    dispatch(updateProfile({ recruiterId: recruiter?.id, profileData: updatedData }))
      .then(() => {
        navigate('/recruiter/profile');
      });
  };

  return (
    <>
      <RecruiterHeader />
      <div className="max-w-4xl mx-auto p-6 lg:p-8 bg-white shadow-lg rounded-lg mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">Update Profile</h1>

          <div>
            <label className="block font-semibold">Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" required />
          </div>

          <div>
            <label className="block font-semibold">Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" required />
          </div>

          <div>
            <label className="block font-semibold">Company Name:</label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" required />
          </div>

          <div>
            <label className="block font-semibold">Company Location:</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" required />
          </div>

          <div>
            <label className="block font-semibold">Phone:</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2" required />
          </div>

          <div>
            <label className="block font-semibold">Government ID:</label>
            <input type="file" name="governmentId" onChange={handleChange} className="w-full p-2" />
          </div>

          <div>
            <label className="block font-semibold">Employee ID Image:</label>
            <input type="file" name="employeeIdImage" onChange={handleChange} className="w-full p-2" />
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300">
            Submit Changes
          </button>
        </form>
      </div>
    </>
  );
};

export default RecruiterProfileUpdate;
