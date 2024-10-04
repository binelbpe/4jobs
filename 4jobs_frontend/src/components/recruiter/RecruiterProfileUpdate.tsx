import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { updateProfile, selectRecruiter } from '../../redux/slices/recruiterSlice';
import { useNavigate } from 'react-router-dom';
import RecruiterHeader from '../recruiter/RecruiterHeader';
import { toast } from 'react-toastify';


interface FormData {
  name: string;
  email: string;
  companyName: string;
  phone: string;
  location: string;
  governmentId: File | null;
  employeeIdImage: File | null;
}

const RecruiterProfileUpdate: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { profile, recruiter } = useSelector(selectRecruiter);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
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


  const emailRegex = /^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/;
  const phoneRegex = /^\d{10}$/;
  const nameRegex = /^[a-zA-Z\s]{3,20}$/;
  const locationRegex = /^[a-zA-Z\s,]{3,15}$/;

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


    if (!nameRegex.test(formData.name)) {
      newErrors.name = 'Name must be 3-20 characters and contain only letters and spaces.';
      valid = false;
    }

   
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
      valid = false;
    }


    if (!nameRegex.test(formData.companyName)) {
      newErrors.companyName = 'Company name must be 3-20 characters and contain only letters and spaces.';
      valid = false;
    }


    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must be a valid 10-digit number.';
      valid = false;
    }

    if (!locationRegex.test(formData.location)) {
      newErrors.location = 'Location must be 3-15 characters and can contain letters, spaces, and commas.';
      valid = false;
    }

    if (formData.governmentId) {
      const fileName = formData.governmentId.name; 
      const validExtensions = /\.(jpg|jpeg|png|pdf|webp)$/i;

      if (!validExtensions.test(fileName)) {
        newErrors.governmentId = 'Government ID must be a valid jpg, jpeg, png, or pdf file.';
        valid = false;
      }
    }

    if (formData.employeeIdImage) {
      const fileName = formData.employeeIdImage.name; 
      const validExtensions = /\.(jpg|jpeg|png|pdf|webp)$/i;

      if (!validExtensions.test(fileName)) {
        newErrors.employeeIdImage = 'Employee ID Image must be a valid jpg, jpeg, png, or pdf file.';
        valid = false;
      }
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
              disabled
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
              disabled
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

       
          <div>
            <button type="submit" className="bg-purple-700 text-white py-2 px-4 rounded-lg hover:bg-purple-600">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RecruiterProfileUpdate;
