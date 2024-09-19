import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store, { persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import Login from './components/user/Login';
import Signup from './components/user/Signup';
import Dashboard from './components/user/Dashboard';
import PrivateRoute from './components/user/PrivateRoute';
import AdminLogin from './components/admin/Login';
import AdminDashboard from './components/admin/Dashboard';
import AdminPrivateRoute from './components/admin/AdminPrivateRoute';
import RecruiterLogin from './components/recruiter/Login';
import RecruiterSignup from './components/recruiter/Register';
import RecruiterDashboard from './components/recruiter/Dashboard';
import RecruiterPrivateRoute from './components/recruiter/RecruiterPrivateRoute';
import VerifyOtp from './components/recruiter/VerifyOtp';
import AdminRecruiterList from './components/admin/AdminRecruiterList';
import LoadingSpinner from './components/LoadingSpinner'; 

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard/*" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
          <Route path="/admin/recruiters" element={<AdminPrivateRoute><AdminRecruiterList /></AdminPrivateRoute>} />

          {/* Recruiter Routes */}
          <Route path="/recruiter" element={<RecruiterLogin />} />
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/recruiter/signup" element={<RecruiterSignup />} />
          <Route path="/recruiter/verify-otp" element={<VerifyOtp />} />
          <Route path="/recruiter/dashboard/*" element={<RecruiterPrivateRoute><RecruiterDashboard /></RecruiterPrivateRoute>} />
        </Routes>
      </PersistGate>
    </Provider>
  );
};

export default App;
