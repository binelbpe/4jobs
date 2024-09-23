import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserExperiences } from '../../redux/slices/authSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { Experience } from '../../types/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Experiences: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [experiences, setExperiences] = useState<Experience[]>(user?.experiences || []);

  // Regex Patterns
  const titleRegex = /^[a-zA-Z0-9\s]{1,30}$/; // Max 30 characters, alphanumeric and spaces
  const companyRegex = /^[a-zA-Z0-9\s]{1,20}$/; // Max 20 characters, alphanumeric and spaces
  const dateRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/; // Month Year format like "Jan 2020"

  const handleChange = (index: number, field: keyof Experience, value: string | boolean) => {
    const updatedExperiences = experiences.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    setExperiences(updatedExperiences);
  };

  const addExperience = () => {
    setExperiences([...experiences, { 
      id: Date.now().toString(),
      title: '', 
      company: '', 
      startDate: '', 
      endDate: '', 
      currentlyWorking: false, 
      description: '' 
    }]);
  };

  const validateExperiences = (): boolean => {
    for (const exp of experiences) {
      if (!exp.title || !exp.company || !exp.startDate || !exp.description) {
        toast.error("All fields except 'End Date' are required.");
        return false;
      }

      // Title Validation
      if (!titleRegex.test(exp.title)) {
        toast.error("Job title can only contain letters, numbers, and spaces, and must be less than 30 characters.");
        return false;
      }

      // Company Validation
      if (!companyRegex.test(exp.company)) {
        toast.error("Company name can only contain letters, numbers, and spaces, and must be less than 20 characters.");
        return false;
      }

      // Start Date Validation
      if (!dateRegex.test(exp.startDate)) {
        toast.error("Start date must be in the format 'MMM YYYY' (e.g., Jan 2020).");
        return false;
      }

      // End Date Validation (optional)
      if (exp.endDate && !dateRegex.test(exp.endDate) && exp.endDate !== "Present") {
        toast.error("End date must be in the format 'MMM YYYY' or 'Present' (e.g., Dec 2022 or Present).");
        return false;
      }

      // Description Validation
      if (exp.description.length > 500) {
        toast.error("Job description must be less than 500 characters.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateExperiences()) return; // Validate before proceeding

    if (user) {
      try {
        await dispatch(updateUserExperiences({ userId: user.id, experiences }));
        toast.success("Experiences updated successfully!");
      } catch (error) {
        console.error("Failed to update experiences:", error);
        toast.error("Failed to update experiences.");
      }
    } else {
      toast.error("User not available.");
    }
  };

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">Experiences</h2>
        {experiences.map((experience, index) => (
          <div key={experience.id} className="space-y-4 p-4 border rounded-md shadow-sm">
            <input
              type="text"
              value={experience.title}
              placeholder="Job Title"
              onChange={(e) => handleChange(index, 'title', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={experience.company}
              placeholder="Company Name"
              onChange={(e) => handleChange(index, 'company', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={experience.startDate}
              placeholder="Start Date (e.g., Jan 2020)"
              onChange={(e) => handleChange(index, 'startDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={experience.endDate}
              placeholder="End Date (e.g., Dec 2022 or Present)"
              onChange={(e) => handleChange(index, 'endDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={experience.currentlyWorking}
                onChange={(e) => handleChange(index, 'currentlyWorking', e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span>Currently Working</span>
            </label>
            <textarea
              value={experience.description}
              placeholder="Job Description"
              onChange={(e) => handleChange(index, 'description', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addExperience}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Add Experience
        </button>
        <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300">
          Update Experiences
        </button>
      </form>
    </>
  );
};

export default Experiences;
