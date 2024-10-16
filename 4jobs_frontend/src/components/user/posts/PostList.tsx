import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPostsByUserId,
  deletePost,
} from "../../../redux/slices/postSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import { Post as PostType } from "../../../types/postTypes";
import { Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../Header";

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast: React.FC<{
  message: string;
  type: "success" | "error";
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg text-white ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
    </div>
  );
};

const UserPostsList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    userPosts = [],
    status,
    error,
    totalPages,
  } = useSelector((state: RootState) => state.posts);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchPostsByUserId({ userId, page: currentPage, limit: 10 }));
    }
  }, [userId, dispatch, currentPage]);

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (postToDelete) {
      try {
        await dispatch(deletePost(postToDelete)).unwrap();
        setToast({ message: "Post deleted successfully", type: "success" });
        if (userId) {
          dispatch(
            fetchPostsByUserId({ userId, page: currentPage, limit: 10 })
          );
        }
      } catch (error) {
        setToast({
          message: "Failed to delete post. Please try again.",
          type: "error",
        });
      } finally {
        setIsDeleteModalOpen(false);
        setPostToDelete(null);
      }
    }
  };

  const handleEdit = (postId: string) => {
    navigate(`/edit-post/${postId}`);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-purple-100">
      <Header />
      {status === "loading" ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : status === "failed" ? (
        <div className="text-red-500 text-center py-4 bg-red-100 border border-red-300 mx-4 mt-4">
          Error: {error}
        </div>
      ) : userPosts.length === 0 ? (
        <div className="text-center py-4 bg-yellow-100 border border-yellow-300 text-yellow-800 mx-4 mt-4">
          No posts found for this user.
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-purple-700 mb-6">
            User Posts
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userPosts.map((post: PostType) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={() => handleDeleteClick(post._id)}
                onEdit={() => handleEdit(post._id)}
              />
            ))}
          </div>
          <Pagination
            postsPerPage={10}
            totalPages={totalPages}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          console.log("Modal closed");
          setIsDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const PostCard: React.FC<{
  post: PostType;
  onDelete: () => void;
  onEdit: () => void;
}> = ({ post, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-4">
        {post.status === "blocked" && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Notice: </strong>
            <span className="block sm:inline">This post has been blocked by an admin.</span>
          </div>
        )}
        <p className="text-gray-600 mb-4">{post.content}</p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        )}
        {post.videoUrl && (
          <video
            src={post.videoUrl}
            controls
            className="w-full h-48 object-cover rounded-md mb-4"
          >
            Your browser does not support the video tag.
          </video>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors duration-300"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-300"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Pagination: React.FC<{
  postsPerPage: number;
  totalPages: number;
  paginate: (number: number) => void;
  currentPage: number;
}> = ({ totalPages, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center mt-8">
      <ul className="flex space-x-2">
        <li>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-3 py-2 rounded-md ${
                currentPage === number
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              {number}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default UserPostsList;
