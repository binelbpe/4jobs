import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserCertificates } from "../../redux/slices/authSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { Certificate } from "../../types/auth";
import { toast } from "react-toastify";
import { X, Edit2 } from 'lucide-react';

interface CertificateWithFile extends Omit<Certificate, "file"> {
  file: File | null;
}

const Certificates: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const initialCertificates: CertificateWithFile[] =
    user && Array.isArray(user.certificates)
      ? user.certificates.map((cert) => ({ ...cert, file: null }))
      : [];

  const [certificates, setCertificates] = useState<CertificateWithFile[]>(initialCertificates);
  const [currentCertificate, setCurrentCertificate] = useState<CertificateWithFile>({
    id: '',
    name: '',
    issuingOrganization: '',
    dateOfIssue: '',
    imageUrl: '',
    file: null,
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    addNewCertificate();
  }, []);

  const handleChange = (field: keyof Omit<Certificate, "id" | "file">, value: string) => {
    setCurrentCertificate((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setCurrentCertificate((prev) => ({ ...prev, file }));
  };

  const validateCertificate = (): boolean => {
    const { name, issuingOrganization, dateOfIssue } = currentCertificate;
    if (!name || !issuingOrganization || !dateOfIssue) {
      toast.error("All fields are required.");
      return false;
    }

    if (name.length > 50 || issuingOrganization.length > 50) {
      toast.error("Certificate name and issuing organization must be less than 50 characters.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCertificate()) return;

    if (user) {
      let updatedCertificates: CertificateWithFile[];

      if (editingIndex !== null) {
        updatedCertificates = certificates.map((cert, index) =>
          index === editingIndex ? currentCertificate : cert
        );
        setEditingIndex(null);
      } else {
        updatedCertificates = [...certificates, currentCertificate];
      }

      const certificatesWithFiles = updatedCertificates.map((cert) => ({
        file: cert.file,
        details: {
          id: cert.id,
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          dateOfIssue: cert.dateOfIssue,
          imageUrl: cert.imageUrl,
        },
      }));

      try {
        await dispatch(updateUserCertificates({ userId: user.id, certificates: certificatesWithFiles }));
        setCertificates(updatedCertificates);
        addNewCertificate();
        toast.success("Certificates updated successfully!");
      } catch (error) {
        toast.error("Failed to update certificates. Please try again later.");
      }
    }
  };

  const addNewCertificate = () => {
    setCurrentCertificate({
      id: Date.now().toString(),
      name: "",
      issuingOrganization: "",
      dateOfIssue: "",
      imageUrl: "",
      file: null,
    });
    setEditingIndex(null);
  };

  const editCertificate = (index: number) => {
    setCurrentCertificate(certificates[index]);
    setEditingIndex(index);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Certificates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {certificates.map((certificate, index) => (
          <div key={`${certificate.id}-${index}`} className="bg-white shadow-md rounded-lg p-6 relative">
            <button
              type="button"
              onClick={() => removeCertificate(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl md:text-2xl font-semibold mb-2 text-gray-800">{certificate.name}</h3>
            <p className="text-gray-600 mb-1">{certificate.issuingOrganization}</p>
            <p className="text-sm md:text-base text-gray-500 mb-4">{certificate.dateOfIssue}</p>
            <button
              type="button"
              onClick={() => editCertificate(index)}
              className="inline-flex items-center px-3 py-2 text-sm md:text-base border border-transparent leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-gray-800">
          {editingIndex !== null ? "Edit Certificate" : "Add New Certificate"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Certificate Name</label>
            <input
              type="text"
              id="name"
              value={currentCertificate.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="issuingOrganization" className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
            <input
              type="text"
              id="issuingOrganization"
              value={currentCertificate.issuingOrganization}
              onChange={(e) => handleChange("issuingOrganization", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="dateOfIssue" className="block text-sm font-medium text-gray-700 mb-1">Date of Issue</label>
            <input
              type="date"
              id="dateOfIssue"
              value={currentCertificate.dateOfIssue}
              onChange={(e) => handleChange("dateOfIssue", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="certificateFile" className="block text-sm font-medium text-gray-700 mb-1">Certificate File</label>
            <input
              type="file"
              id="certificateFile"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              accept="image/*,application/pdf"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {editingIndex !== null ? "Update Certificate" : "Add Certificate"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Certificates;
