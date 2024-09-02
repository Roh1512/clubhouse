import { useState, useCallback, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import PostItem from "./PostItem";
import LoaderAnimation from "../../components/Loader/LoaderAnimation";
import EndOfList from "../../components/Loader/EndOfList";
import Styles from "./Posts.module.css";
import type { Post, PostsLoaderData } from "../../types/Post"; // Adjust the import according to your file structure
// const apiUrl = import.meta.env.VITE_API_BASE_URL;

const Posts = () => {
  const [page, setPage] = useState<number>(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts?page=1&limit=5`, {
          credentials: "include",
        });
        console.log(response);

        const result: PostsLoaderData = await response.json();
        if (response.ok) {
          setPosts(result.all_posts);
          setLoading(false);
        } else {
          throw new Error("Error fetching data");
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const fetchMorePosts = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/posts?page=${nextPage}&limit=5`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error fetching data");
      }

      const data: PostsLoaderData = await response.json();
      // console.log("More data", data);

      setPosts((prevPosts) => {
        // Filter out duplicates
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

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

export default Posts;
