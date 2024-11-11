import React, { useState, useEffect } from "react";

const ProfessionalIcon: React.FC<{ path: string; delay: string }> = ({
  path,
  delay,
}) => (
  <div
    className={`absolute text-purple-300 animate-float opacity-30`}
    style={{
      animationDelay: delay,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  >
    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" clipRule="evenodd" d={path} />
    </svg>
  </div>
);

const FullScreenLoader: React.FC = () => {
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const [comments, setComments] = useState(0);
  const [level, setLevel] = useState(1);
  const [isViral, setIsViral] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isViral) {
        setLikes((prev) => Math.max(0, prev - 2));
        setShares((prev) => Math.max(0, prev - 1));
        setComments((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isViral]);

  useEffect(() => {
    if (likes >= 1000 && shares >= 500 && comments >= 750) {
      setIsViral(true);
    } else {
      setIsViral(false);
    }
  }, [likes, shares, comments]);

  useEffect(() => {
    setLevel(Math.floor((likes + shares * 2 + comments * 1.5) / 1000) + 1);
  }, [likes, shares, comments]);

  const handleLike = () => {
    if (!isViral) setLikes((prev) => prev + 50);
  };

  const handleShare = () => {
    if (!isViral) setShares((prev) => prev + 25);
  };

  const handleComment = () => {
    if (!isViral) setComments((prev) => prev + 35);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 bg-opacity-90 flex flex-col items-center justify-center z-50 overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 overflow-hidden">
        <ProfessionalIcon
          path="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"
          delay="0s"
        />
        <ProfessionalIcon
          path="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"
          delay="2s"
        />
        <ProfessionalIcon
          path="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
          delay="4s"
        />
        <ProfessionalIcon
          path="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 3a1 1 0 00-2 0v1a2 2 0 00-2 2v1a2 2 0 00-2 2v.683a3.7 3.7 0 011.055.485 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0A3.7 3.7 0 0118 12.683V12a2 2 0 00-2-2V9a2 2 0 00-2-2V6a1 1 0 10-2 0v1h-1V6a1 1 0 10-2 0v1H8V6zm10 8.868a3.704 3.704 0 01-4.055-.036 1.704 1.704 0 00-1.89 0 3.704 3.704 0 01-4.11 0 1.704 1.704 0 00-1.89 0A3.704 3.704 0 012 14.868V17a1 1 0 001 1h14a1 1 0 001-1v-2.132zM9 3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z"
          delay="6s"
        />
      </div>
      <div className="absolute top-0 left-0 right-0 bg-purple-700 bg-opacity-75 text-white py-2 text-center font-semibold animate-pulse">
        Uploading your post...
      </div>
      <div className="bg-white bg-opacity-90 rounded-xl p-8 shadow-2xl max-w-md w-full mt-12 transform hover:scale-105 transition-transform duration-300 relative z-10">
        <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center animate-bounce">
          Make Your Post Viral!
        </h2>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-confetti opacity-10 animate-confetti"></div>
            <p className="text-gray-700 font-medium mb-2">
              Your amazing post content goes here...
            </p>
            <div className="flex justify-between items-center">
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 text-pink-500 hover:text-pink-600 transition-colors duration-200 transform hover:scale-110"
              >
                <svg
                  className="w-5 h-5 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <span>{likes} Likes</span>
              </button>
              <button
                onClick={handleComment}
                className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors duration-200 transform hover:scale-110"
              >
                <svg
                  className="w-5 h-5 animate-bounce"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{comments} Comments</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 text-green-500 hover:text-green-600 transition-colors duration-200 transform hover:scale-110"
              >
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span>{shares} Shares</span>
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-purple-700">
              <span className="text-2xl font-bold animate-pulse">
                Level {level}
              </span>
            </div>
            <div className="text-yellow-500">
              {isViral && (
                <div className="flex items-center space-x-2 animate-bounce">
                  <svg
                    className="w-6 h-6 animate-spin"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xl font-bold">Viral!</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-gray-600 animate-pulse">
          {isViral
            ? "Congratulations! Your post went viral!"
            : "Interact with your post to make it go viral!"}
        </p>
      </div>
    </div>
  );
};

export default FullScreenLoader;
