import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserResume } from '../../redux/slices/authSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Resume: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [resume, setResume] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setResume(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && resume) {
      try {
        await dispatch(updateUserResume({ userId: user.id, resume }));
        toast.success('Resume updated successfully!');
      } catch (error) {
        toast.error('Failed to update resume. Please try again later.');
        console.error("Failed to update resume:", error);
      }
    } else {
      toast.error('User is not available or no resume uploaded.');
      console.error("User is not available or no resume uploaded.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">Upload Your Resume</h2>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
      >
        Update Resume
      </button>
    </form>
  );
};

export default Resume;
