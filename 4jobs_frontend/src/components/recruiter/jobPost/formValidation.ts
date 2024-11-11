import { BasicJobPostFormData } from "../../../types/jobPostTypes";

export const validateJobPostForm = (
  formData: BasicJobPostFormData
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!formData.title.trim()) errors.title = "Job title is required";
  if (!formData.description.trim())
    errors.description = "Job description is required";
  if (!formData.company?.name.trim())
    errors.companyName = "Company name is required";
  if (
    formData.company?.website &&
    !/^https?:\/\/\S+$/.test(formData.company.website)
  ) {
    errors.companyWebsite = "Invalid website URL";
  }
  if (!formData.location.trim()) errors.location = "Location is required";
  if (formData.salaryRange.min > formData.salaryRange.max) {
    errors.salaryRange = "Minimum salary cannot be greater than maximum salary";
  }
  if (!formData.wayOfWork.trim()) errors.wayOfWork = "Way of work is required";
  if (formData.skillsRequired.length === 0)
    errors.skillsRequired = "At least one skill is required";
  if (formData.qualifications.length === 0)
    errors.qualifications = "At least one qualification is required";

  return errors;
};
