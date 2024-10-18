import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, blockUser, unblockUser } from '../../redux/slices/adminSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { User } from '../../types/auth';
import Header from './AdminHeader';
import Sidebar from './AdminSidebar';
import { FaBan, FaUnlock, FaSearch, FaTimes } from 'react-icons/fa';

const UserList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { users, loading, error } = useSelector((state: RootState) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleBlock = (userId: string) => {
    dispatch(blockUser(userId));
  };

  const handleUnblock = (userId: string) => {
    dispatch(unblockUser(userId));
  };

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-purple-600">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-2 sm:p-4 md:p-6 flex-grow overflow-auto">
          <div className="mb-4 flex flex-col sm:flex-row">
            <div className="relative flex-grow mb-2 sm:mb-0 sm:mr-2">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg text-gray-700 focus:outline-none focus:border-purple-500"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  <FaTimes className="text-sm sm:text-base" />
                </button>
              )}
            </div>
            <button className="bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-600 text-sm sm:text-base">
              <FaSearch className="inline mr-1" /> Search
            </button>
          </div>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
            <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-purple-800">User List</h1>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm sm:text-base">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Name</th>
                    <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Email</th>
                    <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Status</th>
                    <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200">
                  {filteredUsers.map((user: User) => (
                    <tr key={user.id} className="hover:bg-purple-50">
                      <td className="py-2 sm:py-4 px-3 sm:px-6">{user.name}</td>
                      <td className="py-2 sm:py-4 px-3 sm:px-6">{user.email}</td>
                      <td className="py-2 sm:py-4 px-3 sm:px-6">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="py-2 sm:py-4 px-3 sm:px-6">
                        {user.isBlocked ? (
                          <button
                            onClick={() => handleUnblock(user.id)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded text-xs sm:text-sm inline-flex items-center"
                          >
                            <FaUnlock className="mr-1 sm:mr-2" /> Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(user.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded text-xs sm:text-sm inline-flex items-center"
                          >
                            <FaBan className="mr-1 sm:mr-2" /> Block
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
