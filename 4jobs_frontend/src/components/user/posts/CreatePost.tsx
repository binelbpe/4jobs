import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../../redux/slices/postSlice';
import { RootState, AppDispatch } from "../../../redux/store";
import { ImageIcon, VideoIcon, XIcon } from 'lucide-react';
import Header from '../Header';

const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
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
      setPreviewImage(null);
      setPreviewVideo(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideo(file);
      setPreviewVideo(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewImage(null);
  };

  const removeVideo = () => {
    setVideo(null);
    setPreviewVideo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-100 to-white-200">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-3xl font-bold text-purple-700 mb-6">Create a Post</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex-shrink-0 overflow-hidden">
                  <img src={`${user?.profileImage}`} alt="User avatar" className="w-full h-full object-cover" />
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="w-full px-3 py-2 text-purple-700 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer text-purple-600 hover:bg-purple-100 p-2 rounded-full transition duration-300">
                  <ImageIcon size={20} />
                  <span className="text-sm">Add Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-purple-600 hover:bg-purple-100 p-2 rounded-full transition duration-300">
                  <VideoIcon size={20} />
                  <span className="text-sm">Add Video</span>
                  <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                </label>
              </div>
              {previewImage && (
                <div className="relative">
                  <img src={previewImage} alt="Preview" className="max-w-full h-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-300"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              )}
              {previewVideo && (
                <div className="relative">
                  <video src={previewVideo} controls className="max-w-full h-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-300"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;