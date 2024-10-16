import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, blockUser, unblockUser } from '../../redux/slices/adminSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { User } from '../../types/auth';
import Header from './AdminHeader';
import Sidebar from './AdminSidebar';
import { FaBan, FaUnlock } from 'react-icons/fa';

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
    dispatch(unblockUser(userId));
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-purple-600">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 flex-grow overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-6 text-purple-800">User List</h1>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200">
                  {users.map((user: User) => (
                    <tr key={user.id} className="hover:bg-purple-50">
                      <td className="py-4 px-6 text-sm">{user.name}</td>
                      <td className="py-4 px-6 text-sm">{user.email}</td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {user.isBlocked ? (
                          <button
                            onClick={() => handleUnblock(user.id)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                          >
                            <FaUnlock className="mr-2" /> Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(user.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                          >
                            <FaBan className="mr-2" /> Block
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserList;
