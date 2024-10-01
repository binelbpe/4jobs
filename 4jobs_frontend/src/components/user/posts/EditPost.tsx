import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { editPost } from '../../../redux/slices/postSlice';
import { RootState, AppDispatch } from '../../../redux/store';
import { CreatePostData } from '../../../types/postTypes';
import Header from '../Header';
import { ImageIcon, VideoIcon, XIcon } from 'lucide-react';

const EditPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.auth.user?.id || "");
  const post = useSelector((state: RootState) => 
    state.posts.list.find(p => p._id === postId) || state.posts.userPosts.find(p => p._id === postId)
  );

  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setPreviewImage(post.imageUrl || null);
      setPreviewVideo(post.videoUrl || null);
    }
  }, [post]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postId) {
      const postData: Partial<CreatePostData> = { content };
      if (image) postData.image = image;
      if (video) postData.video = video;
      await dispatch(editPost({ postId, userId, postData }));
      navigate(-1);
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

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-3xl font-bold text-purple-700 mb-6">Edit Post</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="content" className="block text-purple-700 font-bold mb-2">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={handleContentChange}
                  className="w-full px-3 py-2 text-purple-700 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="What's on your mind?"
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
                  className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-300"
                >
                  Update Post
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost;