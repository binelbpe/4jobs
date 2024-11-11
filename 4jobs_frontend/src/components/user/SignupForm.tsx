import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../../redux/slices/authSlice";
import { AppDispatch, RootState } from "../../redux/store";

interface SignupFormProps {
  onSignupSuccess: (email: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [signupError, setSignupError] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const validateField = (fieldName: string, value: string) => {
    let error = "";
    switch (fieldName) {
      case "name":
        if (!/^[^\s][a-zA-Z]{3,}(?:\s[a-zA-Z]*)?$/.test(value)) {
          error =
            "Name must be at least 3 characters long and can include letters and spaces.";
        }
        break;
      case "email":
        if (!/^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/.test(value)) {
          error = "Please enter a valid email address.";
        }
        break;
      case "password":
        if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value
          )
        ) {
          error =
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
        }
        break;
      case "confirmPassword":
        if (value !== password) {
          error = "Passwords do not match.";
        }
        break;
    }
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    validateField("name", name);
    validateField("email", email);
    validateField("password", password);
    validateField("confirmPassword", confirmPassword);

    if (
      Object.values(errors).every((error) => error === "") &&
      password === confirmPassword
    ) {
      try {
        await dispatch(signup({ name, email, password })).unwrap();
        onSignupSuccess(email);
      } catch (error: any) {
        setSignupError(error.message || "Signup failed");
      }
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            validateField("name", e.target.value);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
          required
        />
        {errors.name && (
          <span className="mt-1 text-xs text-red-500">{errors.name}</span>
        )}
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateField("email", e.target.value);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
          required
        />
        {errors.email && (
          <span className="mt-1 text-xs text-red-500">{errors.email}</span>
        )}
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validateField("password", e.target.value);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
          required
        />
        {errors.password && (
          <span className="mt-1 text-xs text-red-500">{errors.password}</span>
        )}
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            validateField("confirmPassword", e.target.value);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
          required
        />
        {errors.confirmPassword && (
          <span className="mt-1 text-xs text-red-500">
            {errors.confirmPassword}
          </span>
        )}
      </div>

      {signupError && <div className="text-sm text-red-500">{signupError}</div>}

      <button
        type="submit"
        disabled={
          Object.values(errors).some((error) => error !== "") ||
          password !== confirmPassword ||
          loading
        }
        className="w-full rounded-md bg-purple-600 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-purple-700 focus:outline-none disabled:opacity-50"
      >
        {loading ? "Signing Up..." : "Sign Up"}
      </button>
    </form>
  );
};

export default SignupForm;
