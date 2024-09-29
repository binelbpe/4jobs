import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../../redux/slices/postSlice';
import { AppDispatch, RootState } from '../../redux/store';
import CreatePost from './posts/CreatePost';
import Post from './posts/Post';

const MainFeed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector((state: RootState) => state.posts.list);
  const status = useSelector((state: RootState) => state.posts.status);
  const error = useSelector((state: RootState) => state.posts.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div><div className="w-full md:w-3/4 p-4">
    <CreatePost />
  </div>Error: {error}</div>;
  }

  return (
    <div className="w-full md:w-3/4 p-4">
      <CreatePost />
      <div className="post-list">
        {posts.map(post => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
};

export default MainFeed;