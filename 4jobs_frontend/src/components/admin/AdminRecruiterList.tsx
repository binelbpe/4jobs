import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecruiters, approveRecruiter } from '../../redux/slices/adminSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { Navigate } from 'react-router-dom';
import '../../styles/admin/RecruiterList.css';

const AdminRecruiterList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { recruiters: fetchedRecruiters, error, loading, isAuthenticatedAdmin, token } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    if (isAuthenticatedAdmin && token) {
      dispatch(fetchRecruiters());
    }
  }, [dispatch, isAuthenticatedAdmin, token]);

  const handleApprove = async (recruiterId: string) => {
    try {
      await dispatch(approveRecruiter(recruiterId)).unwrap();
      dispatch(fetchRecruiters());
    } catch (err) {
      console.error('Failed to approve recruiter', err);
    }
  };

  const handleDownloadGovernmentId = (url: string, recruiterName: string) => {
    const anchor = document.createElement('a');
    const fullurl=`http://localhost:5000/${url}`
    anchor.href =fullurl 
    anchor.setAttribute('download', `${recruiterName}-government-id`);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  if (!isAuthenticatedAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="recruiter-list">
      <h2>Recruiter List</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Government ID</th> {/* New column for Government ID */}
          </tr>
        </thead>
        <tbody>
          {fetchedRecruiters.map(recruiter => (
            <tr key={recruiter._id}>
              <td>{recruiter.name}</td>
              <td>{recruiter.email}</td>
              <td>{recruiter.phone}</td>
              <td>{recruiter.isApproved ? 'Approved' : 'Pending'}</td>
              <td>
                {!recruiter.isApproved && (
                  <button onClick={() => handleApprove(recruiter._id)}>Approve</button>
                )}
              </td>
              <td>
                {recruiter.governmentId ? (
                  <button 
                    onClick={() => handleDownloadGovernmentId(recruiter.governmentId, recruiter.name)}
                  >
                    Download ID
                  </button>
                ) : (
                  <span>No ID uploaded</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRecruiterList;
