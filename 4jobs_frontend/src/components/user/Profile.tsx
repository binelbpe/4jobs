import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../redux/slices/authSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  about: string;
  dateOfBirth: string;
  gender: string;
  skills: string;
  profileImage: File | null;
}

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    about: user?.about || '',
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
    gender: user?.gender || '',
    skills: user?.skills?.join(', ') || '',
    profileImage: null,
  });

  const nameRegex = /^[a-zA-Z\s]{3,20}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/;
  const bioAboutRegex = /^.{1,500}$/; // Limit bio and about sections to 500 characters.
  const skillsRegex = /^[a-zA-Z\s,]{0,200}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData({ ...formData, profileImage: files[0] });
    }
  };

  const validateForm = (): boolean => {
    if (!nameRegex.test(formData.name)) {
      toast.error("Name must contain only letters and spaces (3-20 characters).");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email address.");
      return false;
    }
    if (!bioAboutRegex.test(formData.bio)) {
      toast.error("Bio must be less than 500 characters.");
      return false;
    }
    if (!bioAboutRegex.test(formData.about)) {
      toast.error("About section must be less than 500 characters.");
      return false;
    }
    if (!formData.dateOfBirth) {
      toast.error("Date of Birth is required.");
      return false;
    }
    if (!formData.gender) {
      toast.error("Gender is required.");
      return false;
    }
    if (!skillsRegex.test(formData.skills)) {
      toast.error("Skills must be comma-separated and less than 200 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return; // Validate before proceeding

    const dataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        dataToSubmit.append(key, value);
      }
    });

    if (user) {
      try {
        await dispatch(updateUserProfile({ userId: user.id, formData: dataToSubmit }));
        toast.success('Profile updated successfully!');
      } catch (error) {
        toast.error('Failed to update profile. Please try again later.');
        console.error("Failed to update profile:", error);
      }
    } else {
      toast.error('User is not available.');
      console.error("User is not available.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">Profile</h2>
      <input 
        type="text" 
        name="name" 
        value={formData.name} 
        onChange={handleChange} 
        placeholder="Name" 
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input 
        type="email" 
        name="email" 
        value={formData.email} 
        onChange={handleChange} 
        placeholder="Email" 
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea 
        name="bio" 
        value={formData.bio} 
        onChange={handleChange} 
        placeholder="Bio" 
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea 
        name="about" 
        value={formData.about} 
        onChange={handleChange} 
        placeholder="About" 
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input 
        type="date" 
        name="dateOfBirth" 
        value={formData.dateOfBirth} 
        onChange={handleChange} 
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select 
        name="gender" 
        value={formData.gender} 
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <input 
        type="text" 
        name="skills" 
        value={formData.skills} 
        onChange={handleChange} 
        placeholder="Skills (comma-separated)" 
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input 
        type="file" 
        onChange={handleFileChange} 
        accept="image/*" 
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300">
        Update Profile
      </button>
    </form>
  );
};

export default Profile;
