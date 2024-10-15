import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Header from '../admin/AdminHeader'; 
import Sidebar from '../admin/AdminSidebar'; 

const AdminProfile: React.FC = () => {
  const { token, name,email,role } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
  }, [token]);


  const adminDetails ={name,email,role}
  return (
    <div className="flex">
      <Sidebar /> 
      <div className="flex-1">
        <Header /> 
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6">Admin Profile</h1>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700">Name</label>
                <input
                  type="text"
                  value={adminDetails.name}
                  readOnly
                  className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={adminDetails.email}
                  readOnly
                  className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="font-semibold text-gray-700">Role</label>
                <input
                  type="text"
                  value={adminDetails.role}
                  readOnly
                  className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
