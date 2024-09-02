import Styles from "./LikePostButton.module.css";
import type { Post } from "../../types/Post";
import { GrLike } from "react-icons/gr";
import { useState, useMemo, useCallback } from "react";

import { currentUser } from "../../features/auth/authSlice";
import { useAppSelector } from "../../features/hooks";

import { Spinner } from "react-bootstrap";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

type Props = {
  post: Post;
};

const LikePostButton = (props: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = useAppSelector(currentUser);
  const [post, setPost] = useState<Post>(props.post);

  // Memoize whether the post is liked by the current user
  const isLikedByUser = useMemo(() => {
    return post.likes.some((like) => like.user._id === user?._id);
  }, [post.likes, user?._id]);

  // Memoize className
  const className = useMemo(
    () =>
      isLikedByUser
        ? `${Styles.likeBtn} ${Styles.likeBtnActive}`
        : `${Styles.likeBtn}`,
    [isLikedByUser]
  );

  const likeFunction = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      const result = await response.json();
      setPost(result);
    } catch (error) {
      console.log("Error liking post:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [post._id]);

  return (
    <button
      className={className}
      onClick={likeFunction}
      type="button"
      disabled={isLoading}
    >
      <GrLike />
      {isLoading ? (
        <>
          <Spinner animation="grow" size="sm" />
        </>
      ) : (
        <>{isLikedByUser ? "Unlike" : "Like"}</>
      )}{" "}
      {post.likes.length}
    </button>
  );
};

export default LikePostButton;
