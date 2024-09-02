import type { Post, PostsLoaderData } from "../../types/Post";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import LoaderAnimation from "../../components/Loader/LoaderAnimation";
import EndOfList from "../../components/Loader/EndOfList";
import Styles from "./PostsList.module.css";
import PostItemProfile from "./PostItemProfile";
import AddPostModal from "../../components/AddPostModal/AddPostModal";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    async function result() {
      try {
        setLoading(true);
        const response = await fetch("/api/posts/currentuser?page=1", {
          credentials: "include",
        });
        const result: PostsLoaderData = await response.json();
        // console.log(result);
        if (response.ok) {
          setPosts(result.all_posts);
          setLoading(false);
        } else {
          throw new Error("Error fetching data");
        }
      } catch (error) {
        setLoading(false);
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    result();
  }, []);

  const fetchMorePosts = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const response = await fetch(`/api/posts/currentuser?page=${nextPage}`, {
        credentials: "include",
        method: "GET",
      });

      if (!response.ok) {
        const text = await response.text(); // Get response text to inspect error
        console.error("Server Error:", text);
        throw new Error("Error fetching data");
      }

      const data: PostsLoaderData = await response.json();

      setPosts((prevPosts) => {
        // Filter out duplicates
        const newPosts = data.all_posts.filter(
          (post) => !prevPosts.some((p) => p._id === post._id)
        );
        return [...prevPosts, ...newPosts];
      });

      setCurrentPage(nextPage);
      if (nextPage >= data.totalPages) {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={Styles.containerDIv}>
        <AddPostModal setPosts={setPosts} />
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchMorePosts}
          hasMore={hasMore}
          loader={<LoaderAnimation />}
          endMessage={<EndOfList />}
        >
          <div className={Styles.postsContainer}>
            {posts.map((post) => (
              <PostItemProfile post={post} key={post._id} />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </>
  );
};

export default PostsList;
