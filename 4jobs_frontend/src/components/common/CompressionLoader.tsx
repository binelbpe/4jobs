import React from 'react';

const CompressionLoader: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-purple-300 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-1 bg-purple-500 rounded-full animate-spin">
          <div className="w-2 h-2 bg-white rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>
      <span className="text-purple-600 font-medium">Compressing video...</span>
    </div>
  );
};

export default CompressionLoader;
