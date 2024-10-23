import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { updateUserExperiences } from "../../redux/slices/authSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { Experience } from "../../types/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";

const validateExperience = (experience: Experience): boolean => {
  const { title, company, startDate, endDate, currentlyWorking, description } = experience;

  const titleRegex = /^[a-zA-Z0-9\s]{1,30}$/;
  const companyRegex = /^[a-zA-Z0-9\s]{1,20}$/;
  const dateRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/i;

  if (!title || !company || !startDate || !description) {
    toast.error("All fields except 'End Date' are required.");
    return false;
  }

  if (!titleRegex.test(title)) {
    toast.error("Job title must be 1-30 characters and alphanumeric.");
    return false;
  }

  if (!companyRegex.test(company)) {
    toast.error("Company name must be 1-20 characters and alphanumeric.");
    return false;
  }

  if (!dateRegex.test(startDate)) {
    toast.error("Start date must be in the format 'MMM YYYY' (e.g., Jan 2020).");
    return false;
  }

  if (!currentlyWorking && !endDate) {
    toast.error("Please provide an end date or check 'Currently Working'.");
    return false;
  }

  if (!currentlyWorking && endDate && !dateRegex.test(endDate)) {
    toast.error("End date must be in the format 'MMM YYYY' (e.g., Dec 2022).");
    return false;
  }

  if (endDate && new Date(startDate) > new Date(endDate)) {
    toast.error("End date cannot be earlier than the start date.");
    return false;
  }

  if (description.length > 500) {
    toast.error("Job description must be less than 500 characters.");
    return false;
  }

  return true;
};

const Experiences: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, error } = useSelector((state: RootState) => state.auth);

  const [experiences, setExperiences] = useState<Experience[]>(
    user?.experiences ?? []
  );

  const [currentExperience, setCurrentExperience] = useState<Experience>({
    id: "",
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user && Array.isArray(user.experiences)) {
      setExperiences(user.experiences);
    } else {
      setExperiences([]);
    }
  }, [user]);

  const handleChange = (field: keyof Experience, value: string | boolean) => {
    setCurrentExperience((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateExperience(currentExperience)) return;

    let updatedExperiences;
    if (editingIndex !== null) {
      updatedExperiences = experiences.map((exp, index) =>
        index === editingIndex ? currentExperience : exp
      );
      setEditingIndex(null);
    } else {
      updatedExperiences = [
        ...experiences,
        { ...currentExperience, id: Date.now().toString() },
      ];
    }

    setExperiences(updatedExperiences);

    setCurrentExperience({
      id: "",
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    });

    try {
      await dispatch(
        updateUserExperiences({
          userId: user?.id ?? "",
          experiences: updatedExperiences,
        })
      );
      toast.success("Experiences updated successfully!");
    } catch (error) {
      toast.error("Failed to update experiences. Please try again later.");
    }
  };

  const handleEdit = (index: number) => {
    setCurrentExperience(experiences[index]);
    setEditingIndex(index);
  };

  const removeExperience = async (index: number) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(updatedExperiences);

    try {
      await dispatch(
        updateUserExperiences({
          userId: user?.id ?? "",
          experiences: updatedExperiences,
        })
      );
      toast.success("Experience removed successfully!");
    } catch (error) {
      toast.error("Failed to remove experience. Please try again later.");
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="space-y-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Your Experiences</h2>
        {error && <p className="text-red-500">{error}</p>}
        
 
        <div className="space-y-4">
          {experiences.length > 0 ? (
            experiences.map((experience, index) => (
              <div
                key={experience.id}
                className="bg-white shadow rounded-lg p-4 sm:p-6 relative"
              >
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold">{experience.title}</h3>
                <p className="text-gray-600">{experience.company}</p>
                <p className="text-sm text-gray-500">
                  {experience.startDate} -{" "}
                  {experience.currentlyWorking ? "Present" : experience.endDate}
                </p>
                <p className="mt-2">{experience.description}</p>
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="mt-4 bg-purple-500 text-white py-1 px-3 rounded-lg hover:bg-purple-600 transition duration-300"
                >
                  Edit
                </button>
              </div>
            ))
          ) : (
            <p>No experiences added yet.</p>
          )}
        </div>
   
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingIndex !== null ? "Edit Experience" : "Add New Experience"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Job Title
              </label>
              <input
                type="text"
                id="title"
                value={currentExperience.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company
              </label>
              <input
                type="text"
                id="company"
                value={currentExperience.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>
              <input
                type="text"
                id="startDate"
                value={currentExperience.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                placeholder="e.g., Jan 2020"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                type="text"
                id="endDate"
                value={currentExperience.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                placeholder={
                  currentExperience.currentlyWorking
                    ? "Currently Working"
                    : "e.g., Dec 2022"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={currentExperience.currentlyWorking}
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Job Description
              </label>
              <textarea
                id="description"
                value={currentExperience.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
              ></textarea>
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={currentExperience.currentlyWorking}
                  onChange={(e) =>
                    handleChange("currentlyWorking", e.target.checked)
                  }
                  className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                />
                <span className="ml-2">Currently Working Here</span>
              </label>
            </div>
          </div>
          <div className="mt-6 text-right">
            <button
              type="submit"
              className="w-full sm:w-auto bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition duration-300"
            >
              {editingIndex !== null ? "Update Experience" : "Add Experience"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Experiences;
