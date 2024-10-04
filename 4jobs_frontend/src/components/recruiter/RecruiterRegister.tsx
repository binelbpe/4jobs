import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { register, clearError } from "../../redux/slices/recruiterSlice";
import "../../styles/recruiter/register.css";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    password: "",
    governmentId: null as File | null,
  });
  const [formErrors, setFormErrors] = useState({
    email: "",
    phone: "",
    password: "",
    governmentId: "",
  });

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { error, loading, isAuthenticatedRecruiter } = useSelector(
    (state: RootState) => state.recruiter
  );

  useEffect(() => {
    if (isAuthenticatedRecruiter) {
      navigate("/recruiter/dashboard");
    }
  }, [isAuthenticatedRecruiter, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, governmentId: e.target.files[0] });
    }
  };
  const validateForm = () => {
    const errors = {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      password: "",
      governmentId: "",
    };


    if (formData.name.trim().length < 3) {
      errors.name = "Full Name must be at least 3 characters long.";
    } else if (!formData.name.trim()) {
      errors.name = "Full Name is required.";
    }


    if (formData.companyName.trim().length < 3) {
      errors.companyName = "Company Name must be at least 3 characters long.";
    } else if (!formData.companyName.trim()) {
      errors.companyName = "Company Name is required.";
    }


    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      errors.email = "Please enter a valid email address.";
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number with 10 digits.";
    }

   
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    ) {
      errors.password =
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }


    if (!formData.governmentId) {
      errors.governmentId = "Please upload a government ID.";
    } else {
      const validFileTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      const fileSizeLimit = 2 * 1024 * 1024; 

      if (!validFileTypes.includes(formData.governmentId.type)) {
        errors.governmentId =
          "Please upload a valid file (JPEG, PNG, PDF, WEBP).";
      } else if (formData.governmentId.size > fileSizeLimit) {
        errors.governmentId = "File size must be less than 2 MB.";
      }
    }

    setFormErrors(errors);
    return (
      !errors.name &&
      !errors.companyName &&
      !errors.email &&
      !errors.phone &&
      !errors.password &&
      !errors.governmentId
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      if (error) {
        dispatch(clearError());
      }

      const formDataWithFile = new FormData();
      formDataWithFile.append("name", formData.name);
      formDataWithFile.append("companyName", formData.companyName);
      formDataWithFile.append("phone", formData.phone);
      formDataWithFile.append("email", formData.email);
      formDataWithFile.append("password", formData.password);
      if (formData.governmentId) {
        formDataWithFile.append("governmentId", formData.governmentId);
      }

      try {
        await dispatch(register(formDataWithFile)).unwrap();
        navigate("/recruiter/verify-otp", { state: { email: formData.email } });
      } catch (err) {
       
        console.error("Error registering:", err);
      }
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex flex-col md:flex-row">
          <div className="bg-purple-600 p-12 md:w-2/5">
            <div className="text-8xl font-bold text-white opacity-50">4</div>
            <div className="mt-4 text-4xl font-semibold text-white">JOBS</div>
          </div>
          <div className="p-12 md:w-3/5">
            <h2 className="mb-6 text-3xl font-semibold text-purple-600">
              Recruiter Registration
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Company Name
                </label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Phone
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  type="password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  required
                />
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.password}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Government ID
                </label>
                <input
                  name="governmentId"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none file:mr-4 file:rounded-md file:border-0 file:bg-purple-50 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-100"
                  required
                />
                {formErrors.governmentId && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.governmentId}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-purple-600 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-purple-700 focus:outline-none disabled:opacity-50"
              >
                {loading ? "Registering..." : "Register"}
              </button>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
