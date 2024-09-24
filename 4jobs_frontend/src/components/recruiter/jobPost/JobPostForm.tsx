import React, { useState, useEffect } from 'react';
import { BasicJobPostFormData } from '../../../types/jobPostTypes';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

interface JobPostFormProps {
  initialData?: BasicJobPostFormData;
  recruiterId: string;
  isEditing: boolean;
  onSubmit: (formData: BasicJobPostFormData) => void;
}

const JobPostForm: React.FC<JobPostFormProps> = ({ initialData, recruiterId, isEditing, onSubmit }) => {
  const { recruiter } = useSelector((state: RootState) => state.recruiter);
  const [formData, setFormData] = useState<BasicJobPostFormData>({
    title: '',
    description: '',
    company: { name: '', website: '', logo: '' },
    location: '',
    salaryRange: { min: 0, max: 0 },
    wayOfWork: '',
    skillsRequired: [],
    qualifications: [],
    status: 'Open',
    recruiterId: recruiter.id,
  });
  
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        ...initialData,
        salaryRange: initialData.salaryRange || { min: 0, max: 0 },
        recruiterId: recruiter.id,
      });
    }
  }, [initialData, isEditing, recruiter.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof BasicJobPostFormData] as Record<string, any>), [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'skillsRequired' | 'qualifications') => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [fieldName]: value.split(',').map(item => item.trim()),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Job Title"
        required
        className="w-full p-2 border rounded"
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Job Description"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="company.name"
        value={formData.company.name}
        onChange={handleChange}
        placeholder="Company Name"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="company.website"
        value={formData.company.website}
        onChange={handleChange}
        placeholder="Company Website"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="company.logo"
        value={formData.company.logo}
        onChange={handleChange}
        placeholder="Company Logo URL"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
        required
        className="w-full p-2 border rounded"
      />
      <div className="flex space-x-4">
        <input
          type="number"
          name="salaryRange.min"
          value={formData.salaryRange.min}
          onChange={handleChange}
          placeholder="Minimum Salary"
          className="w-1/2 p-2 border rounded"
        />
        <input
          type="number"
          name="salaryRange.max"
          value={formData.salaryRange.max}
          onChange={handleChange}
          placeholder="Maximum Salary"
          className="w-1/2 p-2 border rounded"
        />
      </div>
      <input
        type="text"
        name="wayOfWork"
        value={formData.wayOfWork}
        onChange={handleChange}
        placeholder="Way of Work (e.g., Remote, On-site, Hybrid)"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        value={formData.skillsRequired.join(', ')}
        onChange={(e) => handleArrayChange(e, 'skillsRequired')}
        placeholder="Skills Required (comma separated)"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        value={formData.qualifications.join(', ')}
        onChange={(e) => handleArrayChange(e, 'qualifications')}
        placeholder="Qualifications (comma separated)"
        className="w-full p-2 border rounded"
      />
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="Open">Open</option>
        <option value="Closed">Closed</option>
      </select>
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {isEditing ? 'Update Job Post' : 'Create Job Post'}
      </button>
    </form>
  );
};

export default JobPostForm;