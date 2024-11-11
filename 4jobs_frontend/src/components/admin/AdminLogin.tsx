import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAdmin, clearError } from "../../redux/slices/adminSlice";
import { RootState, AppDispatch } from "../../redux/store";

const AdminLogin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticatedAdmin, error, loading } = useSelector(
    (state: RootState) => state.admin
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    const errors = { email: "", password: "" };
    if (!/^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password
      )
    ) {
      errors.password =
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }
    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  useEffect(() => {
    if (isAuthenticatedAdmin) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticatedAdmin, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (error) {
        dispatch(clearError());
      }
      dispatch(loginAdmin({ email, password }));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        <div className="bg-purple-600 w-full md:w-2/5 p-8 flex items-center justify-center">
          <h1 className="text-white text-6xl font-bold">
            <span className="text-9xl">4</span>JOBS
          </h1>
        </div>
        <div className="w-full md:w-3/5 p-8">
          <h2 className="text-3xl font-semibold text-purple-600 mb-6">
            Admin Log In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 rounded-full bg-purple-50 border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-full bg-purple-50 border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-full hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
            >
              {loading ? "Logging in..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
