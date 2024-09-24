import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './redux/store';


// Import components
import Login from './components/user/Login';
import Signup from './components/user/Signup';
import Dashboard from './components/user/Dashboard';
import PrivateRoute from './components/user/PrivateRoute';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminPrivateRoute from './components/admin/AdminPrivateRoute';
import RecruiterLogin from './components/recruiter/RecruiterLogin';
import RecruiterSignup from './components/recruiter/RecruiterRegister';
import RecruiterDashboard from './components/recruiter/RecruiterHome';
import RecruiterPrivateRoute from './components/recruiter/RecruiterPrivateRoute';
import VerifyOtp from './components/recruiter/RecruiterVerifyOtp';
import AdminRecruiterList from './components/admin/AdminRecruiterList';
import LoadingSpinner from './components/LoadingSpinner';
import UserProfile from './components/user/UserProfile';
import UpdateProfile from './components/user/UpdateProfile';
import AdminProfile from './components/admin/AdminProfile';
import RecruiterProfile from './components/recruiter/RecruiterProfile';
import RecruiterProfileUpdate from './components/recruiter/RecruiterProfileUpdate';
import JobPostWrapper from './components/recruiter/jobPost/JobPostWrapper';
import CreateJobPost from './components/recruiter/jobPost/CreateJobPost';
import EditJobPost from './components/recruiter/jobPost/EditJobPost';
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
          <Route path="/profile/:userId" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/profile/update/:userId" element={<PrivateRoute><UpdateProfile /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard/*" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
          <Route path="/admin/recruiters" element={<AdminPrivateRoute><AdminRecruiterList /></AdminPrivateRoute>} />
          <Route path="/admin/profile" element={<AdminPrivateRoute><AdminProfile /></AdminPrivateRoute>} />

          {/* Recruiter Routes */}
          <Route path="/recruiter" element={<RecruiterLogin />} />
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/recruiter/signup" element={<RecruiterSignup />} />
          <Route path="/recruiter/verify-otp" element={<VerifyOtp />} />
          <Route path="/recruiter/dashboard/*" element={<RecruiterPrivateRoute><RecruiterDashboard /></RecruiterPrivateRoute>} />
          <Route path="/recruiter/profile" element={<RecruiterPrivateRoute><RecruiterProfile /></RecruiterPrivateRoute>} />
          <Route path="/recruiter/update-profile" element={<RecruiterPrivateRoute><RecruiterProfileUpdate /></RecruiterPrivateRoute>} />
          <Route 
            path="/recruiter/jobs" 
            element={
              <RecruiterPrivateRoute>
                <JobPostWrapper />
              </RecruiterPrivateRoute>
            } 
          />
          <Route 
            path="/recruiter/jobs/create" 
            element={
              <RecruiterPrivateRoute>
                <CreateJobPost />
              </RecruiterPrivateRoute>
            } 
          />
           <Route 
            path="/recruiter/jobs/edit/:id" 
            element={
              <RecruiterPrivateRoute>
                <EditJobPost />
              </RecruiterPrivateRoute>
            } 
          />
        </Routes>
      </PersistGate>
    </Provider>
  );
};

export default App;