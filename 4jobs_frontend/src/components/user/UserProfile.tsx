import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import Header from "../user/Header";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUserProfile } from "../../redux/slices/authSlice";
import LoadingSpinner from "../LoadingSpinner";
import {
  User,
  Info,
  Calendar,
  Award,
  Briefcase,
  FileText,
  Code,
  ExternalLink,
} from "lucide-react";

interface UserProfileProps {
  children?: React.ReactNode;
}

const UserProfile: React.FC<UserProfileProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, userId]);

  const handleUpdateProfile = () => {
    if (userId) {
      navigate(`/profile/update/${userId}`);
    }
  };

  const handleViewPosts = () => {
    if (userId) {
      navigate(`/posts/user/${userId}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="text-center text-gray-600 mt-10">
        No user data available.
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto m-5 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-300 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <img
                src={
                  user?.profileImage
                    ? `${user.profileImage}`
                    : "/default-profile.png"
                }
                alt="Profile"
                className="rounded-full w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 border-4 border-white shadow-lg"
              />
              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold">{user?.name}</h2>
                <p className="text-base md:text-lg mt-1">{user?.email}</p>
                <p className="text-base md:text-lg mt-1">
                  {user?.phone ? user.phone : "Phone number not provided"}
                </p>
                <div className="mt-4 space-x-4">
                  <button
                    className="px-4 py-2 text-sm sm:text-base bg-white text-purple-600 rounded-full hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
                    onClick={handleUpdateProfile}
                  >
                    Update Profile
                  </button>
                  <button
                    className="px-4 py-2 text-sm sm:text-base bg-purple-500 text-white rounded-full hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
                    onClick={handleViewPosts}
                  >
                    View Posts
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <LongProfileDetail
                icon={<Info />}
                title="Bio"
                content={user?.bio || "No bio available."}
              />
              <LongProfileDetail
                icon={<User />}
                title="About"
                content={user?.about || "No details available."}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <ProfileDetail
                icon={<Calendar />}
                title="Date of Birth"
                content={
                  user?.dateOfBirth
                    ? formatDate(user.dateOfBirth)
                    : "Not specified"
                }
              />
              <ProfileDetail
                icon={<User />}
                title="Gender"
                content={user?.gender || "Not specified"}
              />
              <ProfileDetail
                icon={<Award />}
                title="Skills"
                content={user?.skills?.join(", ") || "No skills listed."}
              />
            </div>

            <Section title="Certificates" icon={<Award />}>
              {user?.certificates?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.certificates.map((certificate) => (
                    <CertificateCard
                      key={certificate.id}
                      certificate={certificate}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No certificates listed.</p>
              )}
            </Section>

            <Section title="Resume" icon={<FileText />}>
              {user?.resume ? (
                <a
                  href={`${user.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300"
                >
                  <FileText className="mr-2" size={20} />
                  Download Resume
                </a>
              ) : (
                <p className="text-gray-600">No resume uploaded.</p>
              )}
            </Section>

            <Section title="Projects" icon={<Code />}>
              {user?.projects?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No projects listed.</p>
              )}
            </Section>

            <Section title="Experience" icon={<Briefcase />}>
              {user?.experiences?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.experiences.map((exp) => (
                    <ExperienceCard key={exp.id} experience={exp} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No experience listed.</p>
              )}
            </Section>
          </div>
        </div>
      </div>
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
};

const LongProfileDetail: React.FC<{
  icon: React.ReactNode;
  title: string;
  content: string;
}> = ({ icon, title, content }) => (
  <div className="p-6 bg-gray-50 rounded-lg shadow-md">
    <h4 className="font-semibold text-xl text-gray-800 flex items-center mb-4">
      <span className="mr-2 text-purple-600">{icon}</span>
      {title}
    </h4>
    <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
  </div>
);

const ProfileDetail: React.FC<{
  icon: React.ReactNode;
  title: string;
  content: string;
}> = ({ icon, title, content }) => (
  <div className="p-4 bg-gray-50 rounded-lg shadow-md flex items-start">
    <div className="mr-4 text-purple-600">{icon}</div>
    <div>
      <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
      <p className="text-gray-600 h-auto w-auto mt-1">{content}</p>
    </div>
  </div>
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(); // Show only date
};

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="mt-8">
    <h3 className="text-2xl font-bold mb-4 flex items-center text-gray-800">
      <span className="mr-2 text-purple-600">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

const CertificateCard: React.FC<{ certificate: any }> = ({ certificate }) => (
  <div className="border rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
    <div className="p-4 bg-gray-50">
      <h4 className="font-semibold text-md text-gray-800">
        {certificate.name}
      </h4>
      <p className="text-sm text-gray-600 mt-1">
        Issued by {certificate.issuingOrganization} on{" "}
        {new Date(certificate.dateOfIssue).toLocaleDateString()}
      </p>
    </div>
    {certificate.imageUrl && (
      <img
        src={`${certificate.imageUrl}`}
        alt={certificate.name}
        className="w-full h-48 object-cover"
      />
    )}
  </div>
);

const ProjectCard: React.FC<{ project: any }> = ({ project }) => (
  <div className="border rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
    <div className="p-4 bg-gray-50">
      <h4 className="font-semibold text-md text-gray-800">{project.name}</h4>
      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 hover:text-purple-800 mt-2 inline-flex items-center"
      >
        <ExternalLink size={16} className="mr-1" />
        View Project
      </a>
    </div>
  </div>
);

const ExperienceCard: React.FC<{ experience: any }> = ({ experience }) => (
  <div className="border rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
    <div className="p-4 bg-gray-50">
      <h4 className="font-semibold text-md text-gray-800">
        {experience.position}
      </h4>
      <p className="text-sm text-gray-600 mt-1">
        Company: {experience.company}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Duration: {experience.startDate} - {experience.endDate}
      </p>
      <p className="text-sm text-gray-600 mt-2">{experience.description}</p>
    </div>
  </div>
);

export default UserProfile;
