import React, { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../../redux/slices/postSlice";
import { AppDispatch, RootState } from "../../redux/store";
import CreatePostButton from "../user/posts/CreatePostButton";
import Post from "./posts/Post";

const MainFeed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector((state: RootState) => state.posts.list);
  const status = useSelector((state: RootState) => state.posts.status);
  const error = useSelector((state: RootState) => state.posts.error);
  const hasMore = useSelector((state: RootState) => state.posts.hasMore);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (status === "loading") return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          dispatch(fetchPosts());
        }
      });
      if (node) observer.current.observe(node);
    },
    [status, hasMore, dispatch]
  );

  useEffect(() => {
    dispatch(fetchPosts());
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [dispatch]);

  if (status === "loading" && (!posts || posts.length === 0))
    return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!Array.isArray(posts) || posts.length === 0)
    return <div>No posts available.</div>;

  return (
    <div className="w-full">
      <CreatePostButton />
      <div className="post-list space-y-4">
        {posts.map((post, index) => (
          <div
            key={`${post._id}-${index}`}
            ref={index === posts.length - 1 ? lastPostElementRef : null}
            className="text-xs sm:text-sm md:text-base lg:text-lg"
          >
            <Post {...post} />
          </div>
        ))}
        {status === "loading" && (
          <div className="text-center py-4">Loading more posts...</div>
        )}
        {!hasMore && status !== "loading" && (
          <div className="text-center text-gray-500 py-4">
            All posts for you finished
          </div>
        )}
      </div>
    </div>
  );
};

export default MainFeed;
