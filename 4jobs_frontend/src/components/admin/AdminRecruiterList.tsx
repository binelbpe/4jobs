import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecruiters, approveRecruiter } from '../../redux/slices/adminSlice';
import { RootState, AppDispatch } from '../../redux/store';
import '../../styles/admin/RecruiterList.css'; // Ensure this CSS file exists

const AdminRecruiterList: React.FC = () => {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const adminState = useSelector((state: RootState) => state.admin);
  const { recruiters: fetchedRecruiter, error, loading } = adminState;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(fetchRecruiters()).unwrap();
        setRecruiters(result); // Set recruiters state from the fetched data
      } catch (err) {
        console.error('Failed to fetch recruiters', err);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleApprove = async (recruiterId: string) => {
    try {
      await dispatch(approveRecruiter(recruiterId)).unwrap();
      // Optionally, refetch recruiters or update the local state
      const result = await dispatch(fetchRecruiters()).unwrap();
      setRecruiters(result);
    } catch (err) {
      console.error('Failed to approve recruiter', err);
    }
  };

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
          </tr>
        </thead>
        <tbody>
          {recruiters.map(recruiter => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRecruiterList;
