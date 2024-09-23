import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import Header from "../user/Header";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUserProfile } from "../../redux/slices/authSlice";
import LoadingSpinner from "../LoadingSpinner";

const UserProfile: React.FC = () => {
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div className="text-center">No user data available.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col md:flex-row">
          <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            <img
              src={
                user?.profileImage
                  ? `http://localhost:5000${user.profileImage}`
                  : "/default-profile.png"
              }
              alt="Profile"
              className="rounded-full w-40 h-40 mb-4 border-4 border-purple-600"
            />
            <h2 className="text-2xl font-semibold text-center">{user?.name}</h2>
            <button
              className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
              onClick={handleUpdateProfile}
            >
              Update Profile
            </button>
          </div>
          <div className="md:w-2/3 md:ml-6">
            <h3 className="text-xl font-semibold mb-4">Profile Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <ProfileDetail title="Email" content={user?.email} />
              <ProfileDetail title="Bio" content={user?.bio || "No bio available."} />
              <ProfileDetail title="About" content={user?.about || "No details available."} />
              <ProfileDetail title="Date of Birth" content={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not specified"} />
              <ProfileDetail title="Gender" content={user?.gender || "Not specified"} />
              <ProfileDetail title="Skills" content={user?.skills?.join(", ") || "No skills listed."} />
            </div>

            {/* Certificates Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Certificates</h3>
              {user?.certificates?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.certificates.map((certificate) => (
                    <CertificateCard key={certificate.id} certificate={certificate} />
                  ))}
                </div>
              ) : (
                <p>No certificates listed.</p>
              )}
            </div>

            {/* Resume Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Resume</h3>
              {user?.resume ? (
                <a
                  href={`http://localhost:5000${user.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Download Resume
                </a>
              ) : (
                <p>No resume uploaded.</p>
              )}
            </div>

            {/* Projects Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Projects</h3>
              {user?.projects?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <p>No projects listed.</p>
              )}
            </div>

            {/* Experience Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Experience</h3>
              {user?.experiences?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.experiences.map((exp) => (
                    <ExperienceCard key={exp.id} experience={exp} />
                  ))}
                </div>
              ) : (
                <p>No experience listed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileDetail: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="p-4 bg-gray-50 rounded shadow">
    <h4 className="font-semibold text-lg">{title}</h4>
    <p className="text-gray-700">{content}</p>
  </div>
);

const CertificateCard: React.FC<{ certificate: any }> = ({ certificate }) => (
  <div className="border rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
    <div className="p-4 bg-gray-100">
      <h4 className="font-semibold text-md">{certificate.name}</h4>
      <p className="text-sm text-gray-600">
        Issued by {certificate.issuingOrganization} on {new Date(certificate.dateOfIssue).toLocaleDateString()}
      </p>
    </div>
    {certificate.imageUrl && (
      <img
        src={`http://localhost:5000${certificate.imageUrl}`}
        alt={certificate.name}
        className="w-full h-48 object-cover"
      />
    )}
  </div>
);

const ProjectCard: React.FC<{ project: any }> = ({ project }) => (
  <div className="border rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
    <div className="p-4 bg-gray-100">
      <h4 className="font-semibold text-md">{project.title}</h4>
      <p className="text-sm text-gray-600">{project.description}</p>
      <p className="text-xs text-gray-500">Date: {new Date(project.date).toLocaleDateString()}</p>
    </div>
  </div>
);

const ExperienceCard: React.FC<{ experience: any }> = ({ experience }) => (
  <div className="border rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
    <div className="p-4 bg-gray-100">
      <h4 className="font-semibold text-md">{experience.position}</h4>
      <p className="text-sm text-gray-600">Company: {experience.company}</p>
      <p className="text-xs text-gray-500">Duration: {experience.startDate} - {experience.endDate}</p>
      <p className="text-sm text-gray-600">{experience.description}</p>
    </div>
  </div>
);

export default UserProfile;
