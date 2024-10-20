import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../../redux/slices/postSlice';
import { RootState, AppDispatch } from "../../../redux/store";
import { ImageIcon, VideoIcon, XIcon } from 'lucide-react';
import Header from '../Header';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_CONTENT_LENGTH = 1000;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const validateContent = (text: string) => {
    if (text.length > MAX_CONTENT_LENGTH) {
      setContentError(`Content must be ${MAX_CONTENT_LENGTH} characters or less`);
      return false;
    }
    setContentError(null);
    return true;
  };

  const validateFile = (file: File, isImage: boolean) => {
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size must be 10MB or less');
      return false;
    }
    const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    if (!allowedTypes.includes(file.type)) {
      setFileError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return false;
    }
    setFileError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContent(content)) return;
    if ((image && !validateFile(image, true)) || (video && !validateFile(video, false))) return;
    if (content.trim() || image || video) {
      setShowConfirmModal(true);
    } else {
      toast.error('Please add some content, an image, or a video to your post.');
    }
  };

  const confirmPost = () => {
    if (!user?.id) {
      console.error('User ID is missing.');
      return;
    }
    const postData = {
      content: content.trim() ? content : undefined,
      image: image || undefined,
      video: video || undefined,
    };
    dispatch(createPost({ postData, userId: user.id }))
      .unwrap()
      .then(() => {
        toast.success('Post created successfully!');
        setContent('');
        setImage(null);
        setVideo(null);
        setPreviewImage(null);
        setPreviewVideo(null);
      })
      .catch((error) => {
        toast.error(`Error creating post: ${error.message}`);
      });
    setShowConfirmModal(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file, true)) {
        setImage(file);
        setPreviewImage(URL.createObjectURL(file));
      } else {
        e.target.value = '';
      }
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file, false)) {
        setVideo(file);
        setPreviewVideo(URL.createObjectURL(file));
      } else {
        e.target.value = '';
      }
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
      <ToastContainer position="top-right" autoClose={5000} />
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
                  onChange={(e) => {
                    setContent(e.target.value);
                    validateContent(e.target.value);
                  }}
                  placeholder="What's on your mind?"
                  rows={4}
                  className={`w-full px-3 py-2 text-purple-700 border ${
                    contentError ? 'border-red-500' : 'border-purple-300'
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none`}
                />
                {contentError && <p className="text-red-500 text-sm mt-1">{contentError}</p>}
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
              {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
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
      {showConfirmModal && (
        <ConfirmModal
          onConfirm={confirmPost}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
};

const ConfirmModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-xl font-semibold mb-4">Confirm Post</h3>
        <p className="mb-6">Are you sure you want to publish this post?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition duration-300"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
