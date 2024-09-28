import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchPostsByUserId } from '../../../redux/slices/postSlice';
import Post from './Post';
import { RootState, AppDispatch } from '../../../redux/store';

const PostList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector((state: RootState) => state.posts.userPosts);
  const status = useSelector((state: RootState) => state.posts.status);
  const error = useSelector((state: RootState) => state.posts.error);

  useEffect(() => {
    if (userId) {
      dispatch(fetchPostsByUserId(userId));
    }
  }, [userId, dispatch]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="post-list">
      {posts.map(post => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  );
};

export default PostList;