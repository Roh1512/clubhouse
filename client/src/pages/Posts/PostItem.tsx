import type { Post } from "../../types/Post";
import ImageCarousel from "../../components/ImageCarousel/ImageCarousel";
import { Link } from "react-router-dom";

// import { MdComment } from "react-icons/md";
import CommentsOverlay from "../../components/Comment/CommentButton";

import Styles from "./PostItem.module.css";
// import { Button } from "react-bootstrap";

import LikePostButton from "../../components/LikePostButton/LikePostButton";
import { FaCircleUser } from "react-icons/fa6";

import { formatDistanceToNow } from "date-fns";

type Props = {
  post: Post;
};

const PostItem = (props: Props) => {
  const post = props.post;

  return (
    <div className={Styles.postItem}>
      <div className={Styles.headingDiv}>
        <Link to={`/users/${post.user._id}`} className={Styles.headingLink}>
          <FaCircleUser />
          <h2>{post.user.username}</h2>
        </Link>
        <p className={Styles.dateParagraph}>
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>
      </div>
      <div className={Styles.carouselDiv}>
        <ImageCarousel imageUrls={post.imageUrls} />
      </div>
      <div className={Styles.buttonsDiv}>
        <LikePostButton post={post} />
        <CommentsOverlay post={post} />
      </div>
      <div className={Styles.detailsDiv}>
        <h3>{post.title}</h3>
        <p>{post.description}</p>
      </div>
    </div>
  );
};

export default PostItem;
