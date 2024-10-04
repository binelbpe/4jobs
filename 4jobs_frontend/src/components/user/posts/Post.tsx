import React from 'react';
import { Post as PostType } from '../../../types/postTypes';


const Post: React.FC<PostType> = ({ user, content, imageUrl, videoUrl }) => {
  return (
    <div className="bg-purple-50 purple:bg-purple-100 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl mb-4">
      {/* User Info Section */}
      <div className="p-4 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img 
              src={`${user.profileImage}`} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-purple-900">{user.name}</h3>
            {user.bio && (
              <p className="text-sm text-purple-600 line-clamp-1">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Post Content Section */}
      <div className="p-4 sm:p-6">
        <p className="text-purple-600 dark:text-purple-800 mb-4">{content}</p>
        {imageUrl && (
          <div className="flex justify-center">
            <img 
              src={imageUrl}
              alt=""
              className="w-1/2 h-auto rounded-lg mb-4 object-cover" 
              loading="lazy"
            />
          </div>
        )}
        {videoUrl && (
          <video 
            src={videoUrl} 
            controls 
            className="w-full h-auto rounded-lg mb-4"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
};

export default Post;