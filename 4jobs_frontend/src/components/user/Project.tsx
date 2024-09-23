import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProjects } from '../../redux/slices/authSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { Project } from '../../types/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Projects: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [projects, setProjects] = useState<Project[]>(user?.projects || []);

  // Regex patterns
  const nameRegex = /^[a-zA-Z0-9\s]{1,20}$/; // Max 50 characters, alphanumeric with spaces
  const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/; // Valid URL format (HTTP/HTTPS)

  const handleChange = (index: number, field: keyof Project, value: string) => {
    const updatedProjects = projects.map((project, i) =>
      i === index ? { ...project, [field]: value } : project
    );
    setProjects(updatedProjects);
  };

  const addProject = () => {
    setProjects([...projects, { id: Date.now().toString(), name: '', description: '', link: '', imageUrl: '' }]);
  };

  const validateProjects = (): boolean => {
    for (const project of projects) {
      if (!project.name) {
        toast.error("Project name is required.");
        return false;
      }
      if (!nameRegex.test(project.name)) {
        toast.error("Project name must be alphanumeric and less than 20 characters.");
        return false;
      }
      if (!project.description) {
        toast.error("Project description is required.");
        return false;
      }
      if (project.link && !urlRegex.test(project.link)) {
        toast.error("Project link must be a valid URL (http or https) if provided.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProjects()) return; // Validate before proceeding

    if (user) {
      try {
        await dispatch(updateUserProjects({ userId: user.id, projects }));
        toast.success('Projects updated successfully!');
      } catch (error) {
        toast.error('Failed to update projects. Please try again later.');
        console.error("Failed to update projects:", error);
      }
    } else {
      toast.error('User is not available.');
      console.error("User is not available.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">Projects</h2>
      {projects.map((project, index) => (
        <div key={project.id} className="space-y-2 p-4 border rounded shadow-sm">
          <input
            type="text"
            value={project.name}
            placeholder="Project Name"
            onChange={(e) => handleChange(index, 'name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={project.description}
            placeholder="Project Description"
            onChange={(e) => handleChange(index, 'description', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            value={project.link}
            placeholder="Project Link (optional)"
            onChange={(e) => handleChange(index, 'link', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            value={project.imageUrl}
            placeholder="Image URL (optional)"
            onChange={(e) => handleChange(index, 'imageUrl', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addProject}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Add Project
      </button>
      <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300">
        Update Projects
      </button>
    </form>
  );
};

export default Projects;
