import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor, AppDispatch } from './redux/store';
import { useDispatch } from 'react-redux';
import { initializeAdminState } from './redux/slices/adminSlice';

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
import JobList from './components/user/JobList';
import JobDetail from './components/user/JobDetail';
import JobContestantsList from './components/recruiter/jobPost/JobContestantsList';
import ContestantDetails from './components/recruiter/jobPost/ContestantDetails';
import UserList from './components/admin/UserList';
import PostList from './components/user/posts/PostList';
import CreatePost from './components/user/posts/CreatePost';
import PostsList from './components/user/posts/PostList'
import EditPost from './components/user/posts/EditPost'
import AdminJobPost from './components/admin/AdminJobPost'
import ConnectionProfile from './components/user/ConnectionProfile';
import Connections from './components/user/Connections';
import Messages from './components/user/Messages';
import RecruiterMessage from './components/recruiter/RecruiterMessaging';
import UserMessaging from './components/user/UserMessaging';
import AdminSubscriptionManagement from './components/admin/AdminSubscriptionManagement';
import AdminUserPostManagement from './components/admin/AdminUserPostManagement';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initializeAdminState());
  }, [dispatch]);

  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/profile/:userId" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
      <Route path="/profile/update/:userId" element={<PrivateRoute><UpdateProfile /></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><JobList /></PrivateRoute>} />
      <Route path="/jobs/:jobId" element={<PrivateRoute><JobDetail /></PrivateRoute>} />
      <Route path="/posts/:userId" element={<PrivateRoute><PostList /></PrivateRoute>} />
      <Route path="/posts/create" element={<PrivateRoute><CreatePost /></PrivateRoute>}/>
      <Route path="/posts/user/:userId" element={<PrivateRoute><PostsList /></PrivateRoute>}/>
      <Route path="/edit-post/:postId" element={<PrivateRoute><EditPost /></PrivateRoute>}/>
      <Route path="/connection/profile/:userId" element={<PrivateRoute><ConnectionProfile /></PrivateRoute>} />
      <Route path="/connections" element={<PrivateRoute><Connections /></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
      <Route path="/user/messages" element={<PrivateRoute><UserMessaging /></PrivateRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>} />
      <Route path="/admin/recruiters" element={<AdminPrivateRoute><AdminRecruiterList /></AdminPrivateRoute>} />
      <Route path="/admin/profile" element={<AdminPrivateRoute><AdminProfile /></AdminPrivateRoute>} />
      <Route path="/admin/user" element={<AdminPrivateRoute><UserList /></AdminPrivateRoute>} />
      <Route path="/admin/jobpost" element={<AdminPrivateRoute><AdminJobPost /></AdminPrivateRoute>} />
      <Route path="/admin/subscription" element={<AdminPrivateRoute><AdminSubscriptionManagement /></AdminPrivateRoute>} />
      <Route path="/admin/userposts" element={<AdminPrivateRoute><AdminUserPostManagement /></AdminPrivateRoute>} />

      {/* Recruiter Routes */}
      <Route path="/recruiter" element={<RecruiterLogin />} />
      <Route path="/recruiter/login" element={<RecruiterLogin />} />
      <Route path="/recruiter/signup" element={<RecruiterSignup />} />
      <Route path="/recruiter/verify-otp" element={<VerifyOtp />} />
      <Route path="/recruiter/dashboard/*" element={<RecruiterPrivateRoute><RecruiterDashboard /></RecruiterPrivateRoute>} />
      <Route path="/recruiter/profile" element={<RecruiterPrivateRoute><RecruiterProfile /></RecruiterPrivateRoute>} />
      <Route path="/recruiter/update-profile" element={<RecruiterPrivateRoute><RecruiterProfileUpdate /></RecruiterPrivateRoute>} />
      <Route path="/recruiter/jobs" element={<RecruiterPrivateRoute><JobPostWrapper /></RecruiterPrivateRoute>} />
      <Route path="/recruiter/jobs/create" element={<RecruiterPrivateRoute><CreateJobPost /></RecruiterPrivateRoute>} />
      <Route path="/recruiter/jobs/edit/:id" element={<RecruiterPrivateRoute><EditJobPost /></RecruiterPrivateRoute>} />
      <Route path="/recruiter/job-applicants/:jobId" element={<RecruiterPrivateRoute><JobContestantsList /></RecruiterPrivateRoute>} />
      <Route path="/recruiter/contestant/:contestantId" element={<RecruiterPrivateRoute><ContestantDetails /></RecruiterPrivateRoute>} />
      <Route path="/recruiter/messages" element={<RecruiterPrivateRoute><RecruiterMessage /></RecruiterPrivateRoute>} />
    </Routes>
  );
};

const RootApp: React.FC = () => (
  <Provider store={store}>
    <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

export default RootApp;
