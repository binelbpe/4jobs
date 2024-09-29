import React from 'react';
import { Post as PostType } from '../../../types/postTypes';

const Post: React.FC<PostType> = ({ userId, content, imageUrl, videoUrl }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl mb-4">
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">{userId}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{content}</p>
        {imageUrl && (
          <div className="flex justify-center">
            <img 
              src={`${imageUrl}`}
              alt=""
              className="w-1/2 h-auto rounded-lg mb-4 object-cover" 
              loading="lazy"
            />
          </div>
        )}
        {videoUrl && (
          <video 
            src={`${videoUrl}`} 
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