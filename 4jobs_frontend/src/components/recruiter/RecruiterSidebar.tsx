import React from 'react';
import { useSelector } from 'react-redux';
import { selectRecruiter } from '../../redux/slices/recruiterSlice';
import { User, Briefcase, MapPin, CreditCard, Calendar } from 'lucide-react';

const Sidebar = () => {
  const { recruiter } = useSelector(selectRecruiter);

  return (
    <aside className="hidden md:block shadow-md rounded-lg p-4 bg-white">
      <div className="text-center mb-4">
        <div className="w-20 h-20 rounded-full bg-purple-100 mx-auto mb-2 flex items-center justify-center">
          <User size={40} className="text-purple-600" />
        </div>
        <div className="text-purple-800 text-xl md:text-2xl font-bold">
          {recruiter?.name || 'Recruiter'}
        </div>
        <p className="text-purple-600 mt-2 text-xs md:text-sm lg:text-base">{recruiter?.email}</p>
      </div>
      <div className="border-t border-purple-200 mt-4 pt-4">
        <div className="flex items-center text-purple-700 mb-2 text-sm md:text-base">
          <Briefcase size={16} className="mr-2" />
          <p>Company: <span className="font-bold text-purple-900">{recruiter?.companyName}</span></p>
        </div>
        <div className="flex items-center text-purple-700 mb-2">
          <MapPin size={16} className="mr-2" />
          <p>Location: <span className="font-bold text-purple-900">{recruiter?.location}</span></p>
        </div>
        <div className="flex items-center text-purple-700 mb-2">
          <CreditCard size={16} className="mr-2" />
          <p>Subscribed: <span className="font-bold text-purple-900">{recruiter?.subscribed ? "Yes" : "No"}</span></p>
        </div>
        <div className="flex items-center text-purple-700">
          <Calendar size={16} className="mr-2" />
          <p>Plan: <span className="font-bold text-purple-900">{recruiter?.subscribed ? recruiter?.planDuration : "No plans subscribed"}</span></p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
