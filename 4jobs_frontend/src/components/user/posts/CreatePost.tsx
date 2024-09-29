import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../../redux/slices/postSlice';
import { RootState, AppDispatch } from "../../../redux/store";

const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure user is defined
    if (!user) {
      console.error('User ID is missing.');
      return;
    }
  
    if (content.trim() || image || video) {
      const postData = {
        content: content.trim() ? content : undefined,
        image: image || undefined,
        video: video || undefined,
      };
      
      dispatch(createPost({ postData, userId: user }));
      
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
    <form onSubmit={handleSubmit} className="create-post">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={4}
      />
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <input type="file" accept="video/*" onChange={handleVideoChange} />
      <button type="submit">Post</button>
    </form>
  );
};

export default CreatePost;
