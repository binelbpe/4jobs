import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../../redux/slices/postSlice";
import { RootState, AppDispatch } from "../../../redux/store";
import { ImageIcon, VideoIcon, XIcon } from "lucide-react";
import Header from "../Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import {
  formatFileSize,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  TARGET_VIDEO_SIZE,
  MAX_CONTENT_LENGTH,
} from "../../../utils/fileUtils";
import CompressionLoader from "../../common/CompressionLoader";
import FullScreenLoader from "../../common/FullScreenLoader";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

const CreatePost: React.FC = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [compressedVideo, setCompressedVideo] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateContent = (text: string) => {
    if (text.length > MAX_CONTENT_LENGTH) {
      setContentError(
        `Content must be ${MAX_CONTENT_LENGTH} characters or less`
      );
      return false;
    }
    setContentError(null);
    return true;
  };

  const validateFile = (file: File, isImage: boolean) => {
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      setFileError(
        `File size exceeds the maximum allowed (${formatFileSize(maxSize)})`
      );
      return false;
    }
    const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    if (!allowedTypes.includes(file.type)) {
      setFileError(
        `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
      );
      return false;
    }
    setFileError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (!validateContent(content)) {
      setIsSubmitting(false);
      return;
    }
    if (
      (image && !validateFile(image, true)) ||
      (video && !validateFile(video, false))
    ) {
      setIsSubmitting(false);
      return;
    }

    if (content.trim() || image || video) {
      setShowConfirmModal(true);
    } else {
      toast.error(
        "Please add some content, an image, or a video to your post."
      );
      setIsSubmitting(false);
    }
  };

  const confirmPost = async () => {
    if (!user?.id) {
      console.error("User ID is missing.");
      return;
    }
    setIsConfirmed(true);
    setShowConfirmModal(false);
    setIsProcessing(true);

    if (video && video.size > TARGET_VIDEO_SIZE) {
      toast.info(
        `Compressing video to approximately ${formatFileSize(
          TARGET_VIDEO_SIZE
        )}, please wait...`
      );
      try {
        const compressed = await compressVideo(video);
        setCompressedVideo(compressed);
        toast.success(`Video compressed to ${formatFileSize(compressed.size)}`);
      } catch (error) {
        toast.error("Error compressing video. Please try again.");
        setIsProcessing(false);
        setIsConfirmed(false);
        return;
      }
    }

    setIsUploading(true);
    const postData = {
      content: content.trim() ? content : undefined,
      image: image || undefined,
      video: compressedVideo || video || undefined,
    };

    await createPostInBackend(postData, user.id);
    setIsUploading(false);
    setIsProcessing(false);
    setIsConfirmed(false);
    setIsSubmitting(false);
  };

  const createPostInBackend = useCallback(
    async (postData: any, userId: string) => {
      try {
        await dispatch(createPost({ postData, userId })).unwrap();
        toast.success("Post created successfully!");
        resetForm();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Error creating post: ${error.message}`);
        } else {
          toast.error("An unknown error occurred while creating the post");
        }
      }
    },
    [dispatch]
  );

  const resetForm = () => {
    setContent("");
    setImage(null);
    setVideo(null);
    setCompressedVideo(null);
    setPreviewImage(null);
    setPreviewVideo(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file, true)) {
        setImage(file);
        setPreviewImage(URL.createObjectURL(file));
      } else {
        e.target.value = "";
      }
    }
  };

  const compressVideo = useCallback(async (inputFile: File): Promise<File> => {
    setIsCompressing(true);
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    try {
      const inputFileName = "input.mp4";
      const outputFileName = "output.mp4";
      await ffmpeg.writeFile(inputFileName, await fetchFile(inputFile));

      const duration = await getDuration(inputFile);
      const targetBitrate = Math.floor((TARGET_VIDEO_SIZE * 8) / duration);

      await ffmpeg.exec([
        "-i",
        inputFileName,
        "-b:v",
        `${targetBitrate}`,
        "-maxrate",
        `${targetBitrate * 2}`,
        "-bufsize",
        `${targetBitrate * 4}`,
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        outputFileName,
      ]);

      const data = await ffmpeg.readFile(outputFileName);
      const compressedBlob = new Blob([data], { type: "video/mp4" });
      const compressedFile = new File(
        [compressedBlob],
        "compressed_video.mp4",
        {
          type: "video/mp4",
        }
      );

      return compressedFile;
    } catch (error) {
      console.error("Error compressing video:", error);
      throw error;
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const getDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
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
          toast.info(
            `Compressing video to approximately ${formatFileSize(
              TARGET_VIDEO_SIZE
            )}, please wait...`
          );
          try {
            const compressed = await compressVideo(file);
            setCompressedVideo(compressed);
            setPreviewVideo(URL.createObjectURL(compressed));
            toast.success(
              `Video compressed to ${formatFileSize(compressed.size)}`
            );
          } catch (error) {
            toast.error("Error compressing video. Using original file.");
            setCompressedVideo(file);
          }
        } else {
          setCompressedVideo(file);
        }
      } else {
        e.target.value = "";
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-100 to-white-200">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-6">
              Create a Post
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex-shrink-0 overflow-hidden">
                  <img
                    src={`${user?.profileImage}`}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
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
                    contentError ? "border-red-500" : "border-purple-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base`}
                />
                {contentError && (
                  <p className="text-red-500 text-sm mt-1">{contentError}</p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer text-purple-600 hover:bg-purple-100 p-2 rounded-full transition duration-300 text-sm sm:text-base">
                  <ImageIcon size={20} />
                  <span className="text-sm sm:text-base">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-purple-600 hover:bg-purple-100 p-2 rounded-full transition duration-300 text-sm sm:text-base">
                  <VideoIcon size={20} />
                  <span className="text-sm sm:text-base">Add Video</span>
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
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg"
                  />
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
                  <video
                    src={previewVideo}
                    controls
                    className="max-w-full h-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-300"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              )}
              {fileError && (
                <p className="text-red-500 text-sm mt-1">{fileError}</p>
              )}
              <div className="flex justify-end items-center">
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300 disabled:opacity-50 text-sm sm:text-base"
                  disabled={isUploading || isProcessing}
                >
                  {isUploading
                    ? "Posting..."
                    : isProcessing
                    ? "Processing..."
                    : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {isConfirmed && (isProcessing || isUploading) && <FullScreenLoader />}
      {showConfirmModal && (
        <ConfirmModal
          onConfirm={confirmPost}
          onCancel={() => {
            setShowConfirmModal(false);
          }}
        />
      )}
    </div>
  );
};

const ConfirmModal: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
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
