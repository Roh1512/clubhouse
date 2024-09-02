import { useState, useCallback, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import PostItem from "../../Posts/PostItem";
import LoaderAnimation from "../../../components/Loader/LoaderAnimation";
import EndOfList from "../../../components/Loader/EndOfList";
import Styles from "./PostsByUser.module.css";
import type { Post, PostsLoaderData } from "../../../types/Post"; // Adjust the import according to your file structure

type Props = {
  userid: string | undefined;
};

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

const PostsByUser = ({ userid }: Props) => {
  const [page, setPage] = useState<number>(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const userId = userid!;

  useEffect(() => {
    const fetchPosts = async () => {
      if (!userId) return;
      setPage(1);
      setLoading(true);
      try {
        const response = await fetch(
          `/api/posts/user/${userId}?page=1&limit=5`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error(`Error fetching posts: ${response.statusText}`);
        }
        const result: PostsLoaderData = await response.json();
        setPosts(result.all_posts);
        setHasMore(result.currentPage < result.totalPages);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [userId]);

  const fetchMorePosts = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(
        `/api/posts/user/${userId}?page=${nextPage}&limit=5`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`Error fetching posts: ${response.statusText}`);
      }
      const data: PostsLoaderData = await response.json();
      setPosts((prevPosts) => {
        const newPosts = data.all_posts.filter(
          (post) => !prevPosts.some((p) => p._id === post._id)
        );
        return [...prevPosts, ...newPosts];
      });
      setPage(nextPage);
      if (nextPage >= data.totalPages) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, userId]);

  return (
    <div>
      <InfiniteScroll
        dataLength={posts.length || 0}
        next={fetchMorePosts}
        hasMore={hasMore}
        loader={<LoaderAnimation />}
        endMessage={<EndOfList />}
      >
        <div className={Styles.postsContainer}>
          {posts.map((post) => (
            <PostItem post={post} key={post._id} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default PostsByUser;
