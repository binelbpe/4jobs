import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, resetPosts } from '../../redux/slices/postSlice';
import { AppDispatch, RootState } from '../../redux/store';
import CreatePostButton from '../user/posts/CreatePostButton';
import Post from './posts/Post';

const MainFeed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector((state: RootState) => state.posts.list);
  const status = useSelector((state: RootState) => state.posts.status);
  const error = useSelector((state: RootState) => state.posts.error);
  const hasMore = useSelector((state: RootState) => state.posts.hasMore);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (status === 'loading') return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        dispatch(fetchPosts());
      }
    });
    if (node) observer.current.observe(node);
  }, [status, hasMore, dispatch]);

  useEffect(() => {
    dispatch(resetPosts());
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className="w-full md:w-3/4 p-4 mx-auto">
      <CreatePostButton />
      <div className="post-list space-y-6">
        {posts.map((post, index) => (
          <div key={post.id} ref={index === posts.length - 1 ? lastPostElementRef : null}>
            <Post {...post} />
          </div>
        ))}
        {status === 'loading' && <div className="text-center py-4">Loading more posts...</div>}
        {status === 'failed' && <div className="text-center text-red-500 py-4">Error: {error}</div>}
        {!hasMore && status !== 'loading' && (
          <div className="text-center text-gray-500 py-4">All posts for you finished</div>
        )}
      </div>
    </div>
  );
};

export default MainFeed;