import React from 'react';
import { User } from '../../types/auth';

interface SearchResultsProps {
  results: User[];
  onSelectUser: (userId: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelectUser }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
      {results.map((user) => (
        <div
          key={user.id}
          className="p-3 hover:bg-purple-50 cursor-pointer transition duration-150 ease-in-out"
          onClick={() => onSelectUser(user.id)}
        >
          <div className="flex items-center">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                <span className="text-purple-600 font-semibold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-purple-800">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
