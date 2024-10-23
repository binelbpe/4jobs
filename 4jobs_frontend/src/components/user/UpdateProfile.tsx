import React from 'react';
import Profile from './Profile';
import Resume from './Resume';
import Projects from './Project';
import Certificates from './Certificates';
import Experiences from './Experiences';
import Header from './Header';

const UpdateProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 text-center text-gray-800">
          Update Your Profile
        </h1>

        <div className="space-y-12">
          <Section title="Personal Information">
            <Profile />
          </Section>

          <Section title="Resume">
            <Resume />
          </Section>

          <Section title="Projects">
            <Projects />
          </Section>

          <Section title="Certificates">
            <Certificates />
          </Section>

          <Section title="Work Experience">
            <Experiences />
          </Section>
        </div>
      </main>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <section className="bg-white shadow-md rounded-lg overflow-hidden">
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-purple-300 text-white p-4">
        {title}
      </h2>
      <div className="p-6">
        {children}
      </div>
    </section>
  );
};

export default UpdateProfile;
