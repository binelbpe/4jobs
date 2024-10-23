import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProjects } from '../../redux/slices/authSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { Project } from '../../types/auth';
import { toast } from 'react-toastify';
import { Plus, X } from 'lucide-react';

const Projects: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [projects, setProjects] = useState<Project[]>([]);
  const [errors, setErrors] = useState<{ [key: number]: { name?: string; link?: string; description?: string; imageUrl?: string } }>({});

  useEffect(() => {
    if (user && Array.isArray(user.projects)) {
      setProjects(user.projects);
    }
  }, [user]);

  const handleChange = (index: number, field: keyof Project, value: string) => {
    const updatedProjects = projects.map((project, i) =>
      i === index ? { ...project, [field]: value } : project
    );
    setProjects(updatedProjects);
  };

  const addProject = () => {
    setProjects([...projects, { id: Date.now().toString(), name: '', description: '', link: '', imageUrl: '' }]);
  };

  const removeProject = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[index];
      return newErrors;
    });
  };

  const validateProjects = () => {
    const newErrors: { [key: number]: { name?: string; link?: string; description?: string; imageUrl?: string } } = {};
    let isValid = true;

    projects.forEach((project, index) => {
      const projectErrors: { name?: string; link?: string; description?: string; imageUrl?: string } = {};
      if (!project.name || project.name.length < 2 || project.name.length > 50) {
        projectErrors.name = 'Name must be between 2 and 50 characters.';
        isValid = false;
      }
      if (project.link && !/^https?:\/\/[^\s]+$/.test(project.link)) {
        projectErrors.link = 'Invalid URL format.';
        isValid = false;
      }
      if (project.description && project.description.length > 500) {
        projectErrors.description = 'Description must not exceed 500 characters.';
        isValid = false;
      }
      if (project.imageUrl && !/^https?:\/\/[^\s]+$/.test(project.imageUrl)) {
        projectErrors.imageUrl = 'Invalid URL format.';
        isValid = false;
      }
      if (Object.keys(projectErrors).length) {
        newErrors[index] = projectErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateProjects() && user) {
      try {
        await dispatch(updateUserProjects({ userId: user.id, projects }));
        toast.success('Projects updated successfully!');
      } catch (error) {
        toast.error('Failed to update projects. Please try again later.');
      }
    } else {
      toast.error('Please fix the errors before submitting.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">Projects</h2>
      {projects.map((project, index) => (
        <div key={`${project.id}-${index}`} className="bg-white shadow rounded-lg p-6 relative">
          <button
            type="button"
            onClick={() => removeProject(index)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`project-name-${index}`} className="block text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text"
                id={`project-name-${index}`}
                value={project.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[index]?.name ? 'border-red-500' : ''}`}
              />
              {errors[index]?.name && <p className="text-red-500 text-sm">{errors[index].name}</p>}
            </div>
            <div>
              <label htmlFor={`project-link-${index}`} className="block text-sm font-medium text-gray-700">Project Link</label>
              <input
                type="url"
                id={`project-link-${index}`}
                value={project.link}
                onChange={(e) => handleChange(index, 'link', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[index]?.link ? 'border-red-500' : ''}`}
              />
              {errors[index]?.link && <p className="text-red-500 text-sm">{errors[index].link}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor={`project-description-${index}`} className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id={`project-description-${index}`}
                value={project.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[index]?.description ? 'border-red-500' : ''}`}
                rows={3}
              />
              {errors[index]?.description && <p className="text-red-500 text-sm">{errors[index].description}</p>}
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={addProject}
          className="flex items-center px-4 py-2 text-sm sm:text-base bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Project
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm sm:text-base bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Update Projects
        </button>
      </div>
    </form>
  );
};

export default Projects;
