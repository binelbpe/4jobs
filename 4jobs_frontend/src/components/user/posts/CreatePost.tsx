import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../../redux/slices/postSlice';
import { RootState, AppDispatch } from "../../../redux/store";
import {  ImageIcon, VideoIcon, XIcon } from 'lucide-react';
import Header from '../Header';

const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      console.error('User ID is missing.');
      return;
    }
    if (content.trim() || image || video) {
      const postData = {
        content: content.trim() ? content : undefined,
        image: image || undefined,
        video: video || undefined,
      };
      dispatch(createPost({ postData, userId: user.id }));
      setContent('');
      setImage(null);
      setVideo(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  return (

    <div className="min-h-screen bg-gray-100">
    <Header />
   
    <div className="m-3 bg-white rounded-lg shadow-md p-12 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-purple-700 mb-4">Create a Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex-shrink-0">
            <img src={`http://localhost:5000${user?.profileImage}`} alt="User avatar" className="rounded-full" />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <label className="cursor-pointer text-purple-600 hover:bg-purple-100 p-2 rounded-full transition duration-300">
              <ImageIcon size={20} />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <label className="cursor-pointer text-purple-600 hover:bg-purple-100 p-2 rounded-full transition duration-300">
              <VideoIcon size={20} />
              <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
            </label>
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300"
          >
            Post
          </button>
        </div>
        {(image || video) && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{image ? 'Image' : 'Video'} attached</span>
            <button
              onClick={() => image ? setImage(null) : setVideo(null)}
              className="text-red-500 hover:text-red-700"
            >
              <XIcon size={16} />
            </button>
          </div>
        )}
      </form>
    </div>
    </div>
  );
};

export default CreatePost;