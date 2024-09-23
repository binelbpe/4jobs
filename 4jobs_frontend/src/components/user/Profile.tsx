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
    if (!formData.name) {
      toast.error("Name is required.");
      return false;
    }
    if (!formData.email) {
      toast.error("Email is required.");
      return false;
    }
    if (!formData.bio) {
      toast.error("Bio is required.");
      return false;
    }
    if (!formData.about) {
      toast.error("About section is required.");
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
    if (formData.skills.length > 200) {
      toast.error("Skills must be less than 200 characters.");
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
