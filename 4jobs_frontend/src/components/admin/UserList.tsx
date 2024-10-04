
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, blockUser, unblockUser } from '../../redux/slices/adminSlice';
import { AppDispatch, RootState } from '../../redux/store';

import { User } from '../../types/auth';
import Header from './AdminHeader';
import Sidebar from './AdminSidebar';

const UserList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  

  const { users, loading, error } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleBlock = (userId: string) => {
    dispatch(blockUser(userId));
  };

  const handleUnblock = (userId: string) => {
    console.log("blk use ad",userId)
    dispatch(unblockUser(userId));

  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-4">
        <Header />
        <h1 className="text-xl font-bold mb-4">User List</h1>
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr key={user.id}>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.isBlocked ? 'Blocked' : 'Active'}</td>
                <td className="border px-4 py-2">
                  {user.isBlocked ? (
                    <button
                      onClick={() => handleUnblock(user.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlock(user.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
