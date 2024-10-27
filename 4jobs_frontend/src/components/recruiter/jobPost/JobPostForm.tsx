import React, { useState, useEffect } from "react";
import { BasicJobPostFormData } from "../../../types/jobPostTypes";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  Briefcase,
  Building,
  Globe,
  MapPin,
  IndianRupee,
  Users,
  Book,
  CheckSquare,
} from "lucide-react";
import { validateJobPostForm } from "./formValidation";
import { WORK_TYPES, WorkType } from '../../../constants/jobConstants';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, SelectChangeEvent } from '@mui/material';

interface JobPostFormProps {
  initialData?: BasicJobPostFormData;
  recruiterId: string;
  isEditing: boolean;
  onSubmit: (formData: BasicJobPostFormData) => void;
}

const JobPostForm: React.FC<JobPostFormProps> = ({
  initialData,
  recruiterId,
  isEditing,
  onSubmit,
}) => {
  const { recruiter } = useSelector((state: RootState) => state.recruiter);
  const [formData, setFormData] = useState<BasicJobPostFormData>({
    title: "",
    description: "",
    company: { name: "", website: "", logo: "" },
    location: "",
    salaryRange: { min: 0, max: 0 },
    wayOfWork: "Full-time", // Set a default value from WORK_TYPES
    skillsRequired: [],
    qualifications: [],
    status: "Open",
    recruiterId: recruiter.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        ...initialData,
        salaryRange: initialData.salaryRange || { min: 0, max: 0 },
        recruiterId: recruiter.id,
      });
    }
  }, [initialData, isEditing, recruiter.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof BasicJobPostFormData] as Record<
            string,
            any
          >),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "skillsRequired" | "qualifications"
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value.split(",").map((item) => item.trim()),
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<typeof formData.wayOfWork>) => {
    setFormData(prev => ({
      ...prev,
      wayOfWork: e.target.value as WorkType
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validateJobPostForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="mb-1 font-medium text-gray-700 flex items-center"
        >
          <Briefcase className="mr-2 text-purple-600" size={20} />
          Job Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 font-medium text-gray-700 flex items-center"
        >
          <Book className="mr-2 text-purple-600" size={20} />
          Job Description
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
          rows={4}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="company.name"
            className="mb-1 font-medium text-gray-700 flex items-center"
          >
            <Building className="mr-2 text-purple-600" size={20} />
            Company Name
          </label>
          <input
            type="text"
            name="company.name"
            id="company.name"
            value={formData.company?.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="company.website"
            className="mb-1 font-medium text-gray-700 flex items-center"
          >
            <Globe className="mr-2 text-purple-600" size={20} />
            Company Website
          </label>
          <input
            type="text"
            name="company.website"
            id="company.website"
            value={formData.company?.website}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.companyWebsite && (
            <p className="text-red-500 text-sm mt-1">{errors.companyWebsite}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="location"
          className="mb-1 font-medium text-gray-700 flex items-center"
        >
          <MapPin className="mr-2 text-purple-600" size={20} />
          Location
        </label>
        <input
          type="text"
          name="location"
          id="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="salaryRange.min"
            className="mb-1 font-medium text-gray-700 flex items-center"
          >
            <IndianRupee className="mr-2 text-purple-600" size={20} />
            Minimum Salary
          </label>
          <input
            type="number"
            name="salaryRange.min"
            id="salaryRange.min"
            value={formData.salaryRange.min}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label
            htmlFor="salaryRange.max"
            className="mb-1 font-medium text-gray-700 flex items-center"
          >
            <IndianRupee className="mr-2 text-purple-600" size={20} />
            Maximum Salary
          </label>
          <input
            type="number"
            name="salaryRange.max"
            id="salaryRange.max"
            value={formData.salaryRange.max}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>
      {errors.salaryRange && (
        <p className="text-red-500 text-sm mt-1">{errors.salaryRange}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormControl fullWidth>
          <InputLabel id="wayOfWork-label">Work Type</InputLabel>
          <Select
            labelId="wayOfWork-label"
            id="wayOfWork"
            name="wayOfWork"
            value={formData.wayOfWork}
            onChange={handleSelectChange}
            label="Work Type"
            required
          >
            {WORK_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select the type of work arrangement</FormHelperText>
        </FormControl>

        <div>
          <label
            htmlFor="skillsRequired"
            className="mb-1 font-medium text-gray-700 flex items-center"
          >
            <Users className="mr-2 text-purple-600" size={20} />
            Skills Required (comma separated)
          </label>
          <input
            type="text"
            id="skillsRequired"
            value={formData.skillsRequired.join(", ")}
            onChange={(e) => handleArrayChange(e, "skillsRequired")}
            className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.skillsRequired && (
            <p className="text-red-500 text-sm mt-1">{errors.skillsRequired}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="qualifications"
            className="mb-1 font-medium text-gray-700 flex items-center"
          >
            <CheckSquare className="mr-2 text-purple-600" size={20} />
            Qualifications (comma separated)
          </label>
          <input
            type="text"
            id="qualifications"
            value={formData.qualifications.join(", ")}
            onChange={(e) => handleArrayChange(e, "qualifications")}
            className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.qualifications && (
            <p className="text-red-500 text-sm mt-1">{errors.qualifications}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-1 font-medium text-gray-700 flex items-center"
          >
            <CheckSquare className="mr-2 text-purple-600" size={20} />
            Status
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full p-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition duration-300 ease-in-out flex items-center justify-center text-sm md:text-base"
      >
        <Briefcase className="mr-2" size={20} />
        {isEditing ? "Update Job Post" : "Create Job Post"}
      </button>
    </form>
  );
};

export default JobPostForm;
