import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { likePost, commentOnPost, deletePost } from '../../../redux/slices/postSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import { Post as PostType, Comment, MediaItem } from '../../../types/postTypes';
import { Heart, MessageCircle, Edit3, Trash2, Image, Film } from 'lucide-react';

const MediaGrid: React.FC<{ media: MediaItem[] }> = ({ media }) => {
  const getGridClass = (count: number) => {
    switch (count) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-2";
      default: return "grid-cols-2 sm:grid-cols-3";
    }
  };

  return (
    <div className={`grid ${getGridClass(media.length)} gap-2 mb-4`}>
      {media.map((item, index) => (
        <div key={index} className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
          {item.type === 'image' ? (
            <img src={item.url} alt={`Post image ${index + 1}`} className="object-cover w-full h-full" />
          ) : (
            <video src={item.url} controls className="object-cover w-full h-full">
              Your browser does not support the video tag.
            </video>
          )}
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
            {item.type === 'image' ? <Image size={16} className="text-white" /> : <Film size={16} className="text-white" />}
          </div>
        </div>
      ))}
    </div>
  );
};

const Post: React.FC<PostType & { media: MediaItem[] }> = ({ id, author, content, likes, comments, media }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    if (currentUserId) {
      dispatch(likePost({ postId: id, userId: currentUserId }));
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && currentUserId) {
      dispatch(commentOnPost({ postId: id, userId: currentUserId, content: newComment.trim() }));
      setNewComment('');
    }
  };

  const handleEdit = () => {
    console.log('Edit post:', id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(id));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">{author}</h3>
          <div className="flex space-x-2">
            <button onClick={handleEdit} className="text-purple-600 hover:text-purple-800 transition-colors duration-200">
              <Edit3 size={20} />
            </button>
            <button onClick={handleDelete} className="text-red-500 hover:text-red-700 transition-colors duration-200">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        
        {media && media.length > 0 && <MediaGrid media={media} />}
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">{content}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <button
            onClick={handleLike}
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 transition-colors duration-200"
          >
            <Heart size={18} className={likes > 0 ? "fill-current" : ""} />
            <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 transition-colors duration-200"
          >
            <MessageCircle size={18} />
            <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
          </button>
        </div>
      </div>
      {showComments && (
        <div className="bg-purple-50 dark:bg-gray-700 p-4 sm:p-6">
          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Comments</h4>
          <div className="space-y-2 mb-4">
            {comments.map((comment: Comment, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-600 rounded p-2 text-sm text-gray-700 dark:text-gray-200">
                {comment.content}
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="flex">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow px-3 py-2 border border-purple-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 transition-colors duration-200"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;