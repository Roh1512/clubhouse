import type { Post } from "../../types/Post";
import ImageCarousel from "../../components/ImageCarousel/ImageCarousel";

import Styles from "./PostItemProfile.module.css";

import LikePostButton from "../../components/LikePostButton/LikePostButton";
import EditPostModal from "../../components/EditPostModal/EditPostModal";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import CommentButton from "../../components/Comment/CommentButton";
import DeletePost from "../../components/DeletePost/DeletePost";
import { Link } from "react-router-dom";
import { FaCircleUser } from "react-icons/fa6";

type Props = {
  post: Post;
};

const PostItemProfile = (props: Props) => {
  const [deleted, setDeleted] = useState(false);
  const [post, setPost] = useState<Post>(props.post);

  //Pass it to EditPostModal
  const onPostUpdated = (postItem: Post) => {
    setPost(postItem);
  };

  return (
    <div className={Styles.postItem}>
      {deleted ? (
        <p>Post Deleted</p>
      ) : (
        <>
          <div className={Styles.headingDiv}>
            <Link to={`/users/${post.user._id}`} className={Styles.headingLink}>
              <FaCircleUser />
              <h2>{post.user.username}</h2>
            </Link>
            <p className={Styles.dateParagraph}>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <div className={Styles.carouselDiv}>
            <ImageCarousel imageUrls={post.imageUrls} />
          </div>
          <div className={Styles.buttonsDiv}>
            <LikePostButton post={post} />
            <CommentButton post={post} />
            <EditPostModal post={post} onPostUpdated={onPostUpdated} />
            <DeletePost postId={post._id} setDeleted={setDeleted} />
          </div>
          <div className={Styles.detailsDiv}>
            <h3>{post.title}</h3>
            <p>{post.description}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default PostItemProfile;
