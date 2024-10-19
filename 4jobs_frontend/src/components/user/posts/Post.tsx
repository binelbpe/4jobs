import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Post as PostType, Comment } from "../../../types/postTypes";
import {
  likePost,
  dislikePost,
  commentOnPost,
} from "../../../redux/slices/postSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import { FaThumbsUp, FaThumbsDown, FaComment } from "react-icons/fa";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const Post: React.FC<PostType> = ({
  _id,
  user,
  content,
  imageUrl,
  videoUrl,
  likes,
  comments,
  createdAt,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  const handleLike = () => {
    if (currentUser && currentUser.id && _id) {
      dispatch(likePost({ postId: _id, userId: currentUser.id }));
    }
  };

  const handleDislike = () => {
    if (currentUser && currentUser.id && _id) {
      dispatch(dislikePost({ postId: _id, userId: currentUser.id }));
    }
  };

  const handleComment = () => {
    if (currentUser && currentUser.id && _id && newComment.trim()) {
      const newCommentData = {
        postId: _id,
        userId: currentUser.id,
        content: newComment,
        userName: currentUser.name,
        userProfileImage: currentUser.profileImage,
      };

      dispatch(commentOnPost(newCommentData));

      const localNewComment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        createdAt: new Date().toISOString(),
        userId: {
          id: currentUser.id,
          name: currentUser.name,
          profileImage: currentUser.profileImage,
        },
      };

      setLocalComments((prevComments) => [localNewComment, ...prevComments]);
      setNewComment("");
    }
  };

  const isLiked =
    currentUser && currentUser.id && likes.includes(currentUser.id);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl mb-4 border border-purple-200 dark:border-purple-700">
      {/* User Info Section */}
      <div className="p-4 border-b text-purple-600 border-purple-200 dark:border-purple-700">
        <div className="flex items-center space-x-3">
          <img
            src={user.profileImage || "https://via.placeholder.com/40"}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-purple-800 dark:text-purple-500">
              {user.name}
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {formatDate(createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Post Content Section */}
      <div className="p-4">
        <p className="text-purple-800 dark:text-purple-500 mb-4">{content}</p>
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-auto rounded-lg mb-4 object-cover"
          />
        )}
        {videoUrl && (
          <video
            src={videoUrl}
            controls
            className="w-full h-auto rounded-lg mb-4"
          />
        )}

        {/* Like, Dislike, and Comment Buttons */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                isLiked
                  ? "text-purple-900 dark:text-purple-900"
                  : "text-gray-500 dark:text-gray-400"
              } hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200`}
            >
              <FaThumbsUp />
              <span>{likes.length}</span>
            </button>
            <button
              onClick={handleDislike}
              className="flex items-center space-x-1 text-purple-100 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200"
            >
              <FaThumbsDown />
            </button>
          </div>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-purple-900 dark:text-purple-900 hover:text-purple-900 dark:hover:text-purple-300 transition-colors duration-200"
          >
            <FaComment />
            <span>{localComments.length}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4">
            <h4 className="font-medium text-purple-700 dark:text-purple-900 mb-2">
              Comments
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {localComments.map((comment: Comment) => (
                <div
                  key={comment.id}
                  className="bg-purple-50 dark:bg-purple-100 p-2 rounded-lg flex items-start space-x-2"
                >
                  <img
                    src={
                      comment.userId.profileImage ||
                      "https://via.placeholder.com/40"
                    }
                    alt={comment.userId.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-600">
                      {comment.userId.name}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-500">
                      {comment.content}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-grow px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-purple-100 dark:text-white"
              />
              <button
                onClick={handleComment}
                className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 transition-colors duration-200"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
