import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { editPost, deleteComment } from '../../../redux/slices/postSlice';
import { RootState, AppDispatch } from '../../../redux/store';
import { CreatePostData, Comment } from '../../../types/postTypes';
import Header from '../Header';
import { ImageIcon, VideoIcon, XIcon, TrashIcon } from 'lucide-react';
import ConfirmationModal from '../../common/ConfirmationModal';
import { toast } from 'react-toastify';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { formatFileSize, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE, TARGET_VIDEO_SIZE, MAX_CONTENT_LENGTH } from '../../../utils/fileUtils';
import CompressionLoader from '../../common/CompressionLoader';
import FullScreenLoader from '../../common/FullScreenLoader';

// Update these constants to match CreatePost.tsx
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });
}

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ postData: Partial<CreatePostData>; postId: string; userId: string } | null>(null);
  const [compressedVideo, setCompressedVideo] = useState<File | null>(null);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setPreviewImage(post.imageUrl || null);
      setPreviewVideo(post.videoUrl || null);
    }
  }, [post]);

  const validateContent = (text: string) => {
    if (text.length > MAX_CONTENT_LENGTH) {
      setContentError(`Content must be ${MAX_CONTENT_LENGTH} characters or less`);
      return false;
    }
    setContentError(null);
    return true;
  };

  const validateFile = (file: File, isImage: boolean) => {
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      setFileError(`File size exceeds the maximum allowed (${formatFileSize(maxSize)})`);
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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    validateContent(newContent);
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

  const updatePostInBackend = useCallback(async (postData: Partial<CreatePostData>, postId: string, userId: string) => {
    setIsUploading(true);
    try {
      await dispatch(editPost({ postId, userId, postData }));
      toast.success('Post updated successfully!');
      navigate(-1);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error updating post: ${error.message}`);
      } else {
        toast.error('An unknown error occurred while updating the post');
      }
    } finally {
      setIsUploading(false);
    }
  }, [dispatch, navigate]);

  const compressVideo = useCallback(async (inputFile: File): Promise<File> => {
    setIsCompressing(true);
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    try {
      const inputFileName = 'input.mp4';
      const outputFileName = 'output.mp4';
      ffmpeg.writeFile(inputFileName, await fetchFile(inputFile));

      // Calculate target bitrate based on the desired file size
      const duration = await getDuration(inputFile);
      const targetBitrate = Math.floor((TARGET_VIDEO_SIZE * 8 * 1024 * 1024) / duration);

      await ffmpeg.exec([
        '-i', inputFileName,
        '-b:v', `${targetBitrate}`,
        '-maxrate', `${targetBitrate * 2}`,
        '-bufsize', `${targetBitrate * 4}`,
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-c:a', 'aac',
        '-b:a', '128k',
        outputFileName
      ]);

      const compressedData = await ffmpeg.readFile(outputFileName);
      const compressedBlob = new Blob([compressedData], { type: 'video/mp4' });
      const compressedFile = new File([compressedBlob], 'compressed_video.mp4', { type: 'video/mp4' });

      return compressedFile;
    } finally {
      setIsCompressing(false);
      if (pendingUpdate) {
        const updatedPostData = { ...pendingUpdate.postData, video: inputFile };
        await updatePostInBackend(updatedPostData, pendingUpdate.postId, pendingUpdate.userId);
        setPendingUpdate(null);
      }
    }
  }, [pendingUpdate, updatePostInBackend]);

  const getDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file, false)) {
        setVideo(file);
        setPreviewVideo(URL.createObjectURL(file));
        
        if (file.size > TARGET_VIDEO_SIZE) {
          toast.info(`Compressing video to approximately ${formatFileSize(TARGET_VIDEO_SIZE)}, please wait...`);
          const compressed = await compressVideo(file);
          setCompressedVideo(compressed);
          setPreviewVideo(URL.createObjectURL(compressed));
          toast.success(`Video compressed to ${formatFileSize(compressed.size)}`);
        } else {
          setCompressedVideo(file);
        }
      } else {
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContent(content)) return;
    if ((image && !validateFile(image, true)) || (video && !validateFile(video, false))) return;
    
    if (postId) {
      setIsUploading(true);
      if (video && video.size > TARGET_VIDEO_SIZE) {
        toast.info(`Compressing video to approximately ${formatFileSize(TARGET_VIDEO_SIZE)}, please wait...`);
        try {
          const compressed = await compressVideo(video);
          setCompressedVideo(compressed);
          toast.success(`Video compressed to ${formatFileSize(compressed.size)}`);
        } catch (error) {
          toast.error("Error compressing video. Please try again.");
          return;
        }
      }

      const postData: Partial<CreatePostData> = { content };
      if (image) postData.image = image;
      if (compressedVideo) {
        postData.video = compressedVideo;
      } else if (video) {
        postData.video = video;
      }
      
      if (!content.trim() && !image && !postData.video) {
        toast.error('Please add some content, an image, or a video to your post.');
        return;
      }
      
      await updatePostInBackend(postData, postId, userId);
      setIsUploading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentToDelete(commentId);
    setIsModalOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (postId && commentToDelete) {
      await dispatch(deleteComment({ postId, commentId: commentToDelete }));
      setCommentToDelete(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewImage(null);
  };

  const removeVideo = () => {
    setVideo(null);
    setCompressedVideo(null);
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
                  className={`w-full px-3 py-2 text-purple-700 border ${
                    contentError ? 'border-red-500' : 'border-purple-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  rows={4}
                  placeholder="What's on your mind?"
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
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    disabled={isCompressing}
                  />
                </label>
                {isCompressing && <CompressionLoader />}
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
              <div className="flex justify-end items-center">
                {isCompressing && <span className="text-purple-600 mr-4">Compressing video...</span>}
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? 'Updating...' : 'Update Post'}
                </button>
              </div>
            </form>
          </div>
          <div className="p-6 border-t border-purple-200">
            <h3 className="text-xl font-bold text-purple-700 mb-4">Post Details</h3>
            <p className="text-purple-600 mb-2">Likes: {post.likes.length}</p>
            <p className="text-purple-600 mb-4">Comments: {post.comments.length}</p>
            <h4 className="text-lg font-semibold text-purple-700 mb-2">Comments</h4>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {post.comments.map((comment: Comment) => (
                <div key={comment.id} className="bg-purple-50 p-3 rounded-lg flex justify-between items-start">
                  <div>
                    <p className="text-purple-800 font-medium">{comment.userId.name}</p>
                    <p className="text-purple-600">{comment.content}</p>
                    <p className="text-purple-400 text-sm">{formatDate(comment.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
      />
      {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
      {(isCompressing || isUploading) && <FullScreenLoader />}
    </div>
  );
};

export default EditPost;
