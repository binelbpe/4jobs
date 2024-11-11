import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserResume } from "../../redux/slices/authSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Upload } from "lucide-react";

const Resume: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [resume, setResume] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const allowedTypes = ["application/pdf"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Only PDF files are allowed.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5 MB.");
        return;
      }
      setResume(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && resume) {
      try {
        await dispatch(updateUserResume({ userId: user.id, resume }));
        toast.success("Resume updated successfully!");
      } catch (error) {
        toast.error("Failed to update resume. Please try again later.");
      }
    } else {
      toast.error("Please select a resume file to upload.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">Click to select a file</p>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          className="hidden"
          id="resume-upload"
        />
        <label
          htmlFor="resume-upload"
          className="px-4 py-2 bg-purple-400 text-dark rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
        >
          Select File
        </label>
        {resume && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {resume.name}
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-purple-500 text-dark rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={!resume}
        >
          Upload Resume
        </button>
      </div>
    </form>
  );
};

export default Resume;
