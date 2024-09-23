import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { updateProfile, selectRecruiter } from '../../redux/slices/recruiterSlice';
import { useNavigate } from 'react-router-dom';
import RecruiterHeader from '../recruiter/RecruiterHeader';
import { toast } from 'react-toastify';

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

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    companyName: '',
    phone: '',
    location: '',
    governmentId: '',
    employeeIdImage: '',
  });

  // Regex patterns for validation
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/;
  const phoneRegex = /^\d{10}$/;
  const nameRegex = /^[a-zA-Z\s]{3,20}$/;
  const locationRegex = /^[a-zA-Z\s,]{3,15}$/;
  const fileExtensionRegex = /\.(jpg|jpeg|png|pdf)$/i;

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      companyName: '',
      phone: '',
      location: '',
      governmentId: '',
      employeeIdImage: '',
    };

    // Validate name
    if (!nameRegex.test(formData.name)) {
      newErrors.name = 'Name must be 3-20 characters and contain only letters and spaces.';
      valid = false;
    }

    // Validate email
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
      valid = false;
    }

    // Validate company name (same as name regex)
    if (!nameRegex.test(formData.companyName)) {
      newErrors.companyName = 'Company name must be 3-20 characters and contain only letters and spaces.';
      valid = false;
    }

    // Validate phone
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must be a valid 10-digit number.';
      valid = false;
    }

    // Validate location
    if (!locationRegex.test(formData.location)) {
      newErrors.location = 'Location must be 3-15 characters and can contain letters, spaces, and commas.';
      valid = false;
    }

    // Validate government ID file (optional) if provided
    if (formData.governmentId && !fileExtensionRegex.test(formData.governmentId)) {
      newErrors.governmentId = 'Government ID must be a valid jpg, jpeg, png, or pdf file.';
      valid = false;
    }

    // Validate employee ID image (optional) if provided
    if (formData.employeeIdImage && !fileExtensionRegex.test(formData.employeeIdImage)) {
      newErrors.employeeIdImage = 'Employee ID Image must be a valid jpg, jpeg, png, or pdf file.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

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
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

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

          {/* Name */}
          <div>
            <label className="block font-semibold">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
              required
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
              required
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Company Name */}
          <div>
            <label className="block font-semibold">Company Name:</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className={`w-full border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
              required
            />
            {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block font-semibold">Company Location:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
              required
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block font-semibold">Phone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
              required
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>

          {/* Government ID */}
          <div>
            <label className="block font-semibold">Government ID:</label>
            <input
              type="file"
              name="governmentId"
              onChange={handleChange}
              className={`w-full p-2`}
            />
            {errors.governmentId && <p className="text-red-500 text-sm">{errors.governmentId}</p>}
          </div>

          {/* Employee ID Image */}
          <div>
            <label className="block font-semibold">Employee ID Image:</label>
            <input
              type="file"
              name="employeeIdImage"
              onChange={handleChange}
              className={`w-full p-2`}
            />
            {errors.employeeIdImage && <p className="text-red-500 text-sm">{errors.employeeIdImage}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
          >
            Submit Changes
          </button>
        </form>
      </div>
    </>
  );
};

export default RecruiterProfileUpdate;
