import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setResumeData, generateResumeStart, generateResumeSuccess, generateResumeFailure } from '../../redux/slices/resumeSlice';
import { generateResumeApi } from '../../api/authapi';
import { ResumeData, Project, Experience, Education } from '../../types/resumeTypes';
import UserHeader from './Header';
import { validateInput } from '../../utils/inputValidation';

const ResumeBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const { loading, generatedResumeLink, error } = useSelector((state: RootState) => state.resume);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [formData, setFormData] = useState<ResumeData>({
    userId: userId || '',
    fullName: '',
    email: '',
    phone: '',
    profileSummary: '',
    skills: [],
    projects: [],
    experience: [],
    education: [],
  });

  const [formErrors, setFormErrors] = useState<Partial<ResumeData>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = validateInput(value);
    setFormData({ ...formData, [name]: sanitizedValue });
    validateField(name, sanitizedValue);
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (value.length < 2) error = 'Name must be at least 2 characters long';
        break;
      case 'email':
        if (!/\S+@\S+\.\S+/.test(value)) error = 'Invalid email address';
        break;
      case 'phone':
        if (!/^\+?[\d\s-]{10,14}$/.test(value)) error = 'Invalid phone number';
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => validateInput(skill.trim()));
    setFormData({ ...formData, skills });
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    const updatedProjects = [...formData.projects];
    if (field === 'technologies') {
      updatedProjects[index] = { 
        ...updatedProjects[index], 
        [field]: value.split(',').map(tech => tech.trim()) 
      };
    } else {
      updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    }
    setFormData({ ...formData, projects: updatedProjects });
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setFormData({ ...formData, experience: updatedExperience });
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setFormData({ ...formData, education: updatedEducation });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { name: '', description: '', technologies: [], link: '' }],
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: '', position: '', startDate: '', endDate: '', description: '' }],
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: '', degree: '', field: '', graduationDate: '' }],
    });
  };

  const removeProject = (index: number) => {
    const updatedProjects = formData.projects.filter((_, i) => i !== index);
    setFormData({ ...formData, projects: updatedProjects });
  };

  const removeExperience = (index: number) => {
    const updatedExperience = formData.experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: updatedExperience });
  };

  const removeEducation = (index: number) => {
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: updatedEducation });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      dispatch(generateResumeFailure('User ID is missing. Please log in again.'));
      return;
    }
    if (Object.values(formErrors).some(error => error !== '')) {
      dispatch(generateResumeFailure('Please correct the errors in the form.'));
      return;
    }
    dispatch(setResumeData(formData));
    dispatch(generateResumeStart());
    try {
      const resumeURL = await generateResumeApi({ ...formData, userId });
      dispatch(generateResumeSuccess(resumeURL));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(generateResumeFailure(error.message));
      } else {
        dispatch(generateResumeFailure('An unknown error occurred'));
      }
    }
  };

  return (
    <>
      <UserHeader />
      <div className="max-w-4xl m-3 mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-purple-700 mb-6">Resume Builder</h1>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-purple-700">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm
                  ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {formErrors.fullName && <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm
                  ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-purple-700">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
            />
            {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
          </div>
          <div>
            <label htmlFor="profileSummary" className="block text-sm font-medium text-purple-700">Profile Summary</label>
            <textarea
              id="profileSummary"
              name="profileSummary"
              value={formData.profileSummary}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
            ></textarea>
            {formErrors.profileSummary && <p className="mt-1 text-sm text-red-500">{formErrors.profileSummary}</p>}
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-purple-700">Skills (comma-separated)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills.join(', ')}
              onChange={handleSkillsChange}
              className="mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
            />
            {formErrors.skills && <p className="mt-1 text-sm text-red-500">{formErrors.skills}</p>}
          </div>

          {/* Projects */}
          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">Projects</h2>
            {formData.projects.map((project, index) => (
              <div key={index} className="mb-4 p-4 border border-purple-200 rounded-md relative">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={project.name}
                  onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                  className="mb-2 w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <textarea
                  placeholder="Project Description"
                  value={project.description}
                  onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                  className="mb-2 w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="Technologies (comma-separated)"
                  value={project.technologies.join(', ')}
                  onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                  className="mb-2 w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="Project Link (optional)"
                  value={project.link}
                  onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                  className="w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addProject} className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm sm:text-base md:text-lg lg:text-xl">
              Add Project
            </button>
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">Experience</h2>
            {formData.experience.map((exp, index) => (
              <div key={index} className="mb-4 p-4 border border-purple-200 rounded-md relative">
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  className="mb-2 w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={exp.position}
                  onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                  className="mb-2 w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="Start Date"
                  value={exp.startDate}
                  onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                  className="mb-2 w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="End Date"
                  value={exp.endDate}
                  onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                  className="mb-2 w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <textarea
                  placeholder="Description"
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  className="w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addExperience} className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm sm:text-base md:text-lg lg:text-xl">
              Add Experience
            </button>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">Education</h2>
            {formData.education.map((edu, index) => (
              <div key={index} className="mb-4 p-4 border border-purple-200 rounded-md relative">
                <input
                  type="text"
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  className="mb-2 w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  className="mb-2 w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={edu.field}
                  onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                  className="mb-2 w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <input
                  type="text"
                  placeholder="Graduation Date"
                  value={edu.graduationDate}
                  onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
                  className="w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addEducation} className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm sm:text-base md:text-lg lg:text-xl">
              Add Education
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 transition duration-300 disabled:opacity-50 text-sm sm:text-base md:text-lg lg:text-xl"
            disabled={loading || Object.values(formErrors).some(error => error !== '')}
          >
            {loading ? 'Generating...' : 'Generate Resume'}
          </button>
        </form>
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {generatedResumeLink && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-purple-700 mb-2">Generated Resume</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <a
                href={generatedResumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline"
              >
                View Your Resume
              </a>
              <a
                href={generatedResumeLink}
                download="resume.pdf"
                className="text-purple-600 hover:text-purple-800 underline"
              >
                Download Your Resume
              </a>
            </div>
            <div className="mt-4">
              <iframe
                src={generatedResumeLink}
                title="Generated Resume"
                width="100%"
                height="600px"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResumeBuilder;
