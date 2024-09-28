import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../redux/slices/authSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone?.toString() || '',
    bio: user?.bio || '',
    about: user?.about || '',
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
    gender: user?.gender || '',
    skills: user?.skills?.join(', ') || '',
    profileImage: null as File | null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData({ ...formData, profileImage: files[0] });
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: { [key: string]: string } = {};

    if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = 'Name must be between 2 and 50 characters.';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
      isValid = false;
    }

    if (formData.bio.length > 1000) {
      newErrors.bio = 'Bio must not exceed 1000 characters.';
      isValid = false;
    }

    if (formData.about.length > 1000) {
      newErrors.about = 'About section must not exceed 1000 characters.';
      isValid = false;
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of Birth is required.';
      isValid = false;
    }

    const skillsArray = formData.skills.split(',').map(skill => skill.trim());
    if (skillsArray.length > 10) {
      newErrors.skills = 'You can list a maximum of 10 skills.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (user) {
        const dataToSubmit = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null) {
            dataToSubmit.append(key, value);
          }
        });

        try {
          await dispatch(updateUserProfile({ userId: user.id, formData: dataToSubmit }));
          toast.success('Profile updated successfully!');
        } catch (error) {
          toast.error('Failed to update profile. Please try again later.');
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="phone"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.bio ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
          {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="about" className="block text-sm font-medium text-gray-700">About</label>
          <textarea
            id="about"
            name="about"
            rows={5}
            value={formData.about}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.about ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
          {errors.about && <p className="text-red-500 text-sm">{errors.about}</p>}
        </div>
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.skills ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
          {errors.skills && <p className="text-red-500 text-sm">{errors.skills}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">Profile Image</label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Update Profile
        </button>
      </div>
    </form>
  );
};

export default Profile;
