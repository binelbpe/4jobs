import React from 'react';
import { useSelector } from 'react-redux';
import { selectRecruiter } from '../../redux/slices/recruiterSlice';

const Sidebar = () => {
  const { recruiter } = useSelector(selectRecruiter);

  return (
    <aside className="hidden md:block bg-white shadow-md rounded-lg p-4">
      <div className="text-center mb-4">
        <div className="text-purple-600 text-2xl font-bold">
          {recruiter?.name || 'Recruiter'}
        </div>
        <p className="text-gray-500 mt-2">Lorem Ipsum is dummy text of the printing industry.</p>
      </div>
      <div className="border-t border-gray-200 mt-4 pt-4">
        <p className="text-gray-700">Profile viewers: <span className="font-bold">55</span></p>
        <p className="text-gray-700">Post impressions: <span className="font-bold">21</span></p>
      </div>
      <button className="w-full mt-4 bg-purple-600 text-white p-2 rounded-lg">
        Try premium for $39!
      </button>
    </aside>
  );
};

export default Sidebar;
