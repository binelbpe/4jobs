import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserCertificates } from "../../redux/slices/authSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { Certificate } from "../../types/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CertificateWithFile extends Omit<Certificate, "file"> {
  file: File | null;
}

const Certificates: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // Handle possible null user and ensure certificates is always an array
  const initialCertificates: CertificateWithFile[] =
    user && Array.isArray(user.certificates)
      ? user.certificates.map((cert) => ({ ...cert, file: null }))
      : [];

  const [certificates, setCertificates] =
    useState<CertificateWithFile[]>(initialCertificates);

  const handleChange = (
    index: number,
    field: keyof Omit<Certificate, "id" | "file">,
    value: string
  ) => {
    const updatedCertificates = certificates.map((cert, i) =>
      i === index ? { ...cert, [field]: value } : cert
    );
    setCertificates(updatedCertificates);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updatedCertificates = certificates.map((cert, i) =>
      i === index ? { ...cert, file } : cert
    );
    setCertificates(updatedCertificates);
  };

  const addCertificate = () => {
    setCertificates([
      ...certificates,
      {
        id: Date.now().toString(),
        name: "",
        issuingOrganization: "",
        dateOfIssue: "",
        imageUrl: "",
        file: null,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const certificatesWithFiles = certificates.map((cert) => ({
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
        await dispatch(
          updateUserCertificates({
            userId: user.id,
            certificates: certificatesWithFiles,
          })
        );
        toast.success("Certificates updated successfully!");
      } catch (error) {
        console.error("Failed to update certificates:", error);
        toast.error("Failed to update certificates.");
      }
    } else {
      toast.error("User not available.");
    }
  };

  return (
    <>
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Certificates</h2>
        {certificates.map((certificate, index) => (
          <div
            key={certificate.id}
            className="space-y-4 p-4 border rounded-md shadow-sm"
          >
            <input
              type="text"
              value={certificate.name}
              placeholder="Certificate Name"
              onChange={(e) => handleChange(index, "name", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={certificate.issuingOrganization}
              placeholder="Issuing Organization"
              onChange={(e) =>
                handleChange(index, "issuingOrganization", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={certificate.dateOfIssue}
              onChange={(e) =>
                handleChange(index, "dateOfIssue", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              name="certificates"
              multiple
              onChange={(e) =>
                handleFileChange(
                  index,
                  e.target.files ? e.target.files[0] : null
                )
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept="image/*,application/pdf"
            />

            {certificate.file && (
              <p className="text-sm text-gray-500">
                Selected file: {certificate.file.name}
              </p>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addCertificate}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Add Certificate
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Update Certificates
        </button>
      </form>
    </>
  );
};

export default Certificates;
