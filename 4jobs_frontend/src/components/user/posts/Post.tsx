import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { likePost, commentOnPost, deletePost } from '../../../redux/slices/postSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import { Post as PostType, Comment } from '../../../types/postTypes';

const Post: React.FC<PostType> = ({ id, author, content, likes, comments }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  const handleLike = () => {
    if (currentUserId) {
      dispatch(likePost({ postId: id, userId: currentUserId }));
    }
  };

  const handleComment = () => {
    const commentContent = prompt('Enter your comment:');
    if (commentContent && currentUserId) {
      dispatch(commentOnPost({ postId: id, userId: currentUserId, content: commentContent }));
    }
  };

  const handleEdit = () => {
    // Implement edit functionality
    console.log('Edit post:', id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(id));
    }
  };

  return (
    <div className="post bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-xl font-semibold mb-2">{author}</h3>
      <p className="mb-4">{content}</p>
      <div className="post-actions flex space-x-4 mb-4">
        <button onClick={handleLike} className="bg-blue-500 text-white px-4 py-2 rounded">
          Like ({likes})
        </button>
        <button onClick={handleComment} className="bg-green-500 text-white px-4 py-2 rounded">
          Comment ({comments.length})
        </button>
        <button onClick={handleEdit} className="bg-yellow-500 text-white px-4 py-2 rounded">
          Edit
        </button>
        <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
          Delete
        </button>
      </div>
      <div className="post-comments">
        <h4 className="font-semibold mb-2">Comments:</h4>
        {comments.map((comment: Comment, index: number) => (
          <p key={index} className="mb-1">{comment.content}</p>
        ))}
      </div>
    </div>
  );
};

export default Post;