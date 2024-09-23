import React from 'react';
import Profile from './Profile';
import Resume from './Resume';
import Projects from './Project';
import Certificates from './Certificates';
import Experiences from './Experiences'; // Assuming you have an Experiences component
import Header from './Header';

const UpdateProfile: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Update Profile</h1>
        <Profile />
        <Resume />
        <Projects />
        <Certificates />
        <Experiences /> {/* Include the Experiences component here */}
      </div>
    </div>
  );
};

export default UpdateProfile;
