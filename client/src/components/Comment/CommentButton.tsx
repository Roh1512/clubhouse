import { useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroll-component";

import Styles from "./CommentButton.module.css";

import { MdComment, MdAddComment } from "react-icons/md";

import { Post } from "../../types/Post";
import type { Comment } from "../../types/Like";
import LoaderAnimation from "../Loader/LoaderAnimation";
import { formatDistanceToNow, parseISO } from "date-fns";
import { currentUser } from "../../features/auth/authSlice";
import { useAppSelector } from "../../features/hooks";
import { Spinner } from "react-bootstrap";
import { useTheme } from "../../context/ThemeContext.tsx/ThemeContext";
import ImageCarousel from "../ImageCarousel/ImageCarousel";
import { FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

type Props = {
  post: Post;
};

function CommentButton({ post }: Props) {
  const { theme } = useTheme();
  const user = useAppSelector(currentUser);

  const [commentContent, setCommentContent] = useState<string>("");
  const [show, setShow] = useState(false);
  const [commentsByPostId, setCommentsByPostId] = useState<
    Record<string, Comment[]>
  >({});
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const [hasMore, setHasMore] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [numberOfComments, setNumberOfComments] = useState<number>(
    post.comments.length
  );
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleClose = () => setShow(false);

  const handleShow = async () => {
    setShow(true);
    await fetchComments(post._id, 1);
  };

  const fetchComments = async (postId: string, page: number) => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/posts/${String(postId)}/comments?page=${page}&limit=5`
      );

      const data = await response.json();

      if (response.ok) {
        setCommentsByPostId((prev) => ({
          ...prev,
          [postId]: page === 1 ? data : [...(prev[postId] || []), ...data],
        }));

        setCurrentPage((prev) => ({
          ...prev,
          [postId]: page,
        }));

        setHasMore((prev) => ({
          ...prev,
          [postId]: data.length === 5, // Assume no more comments if fewer than 5 are returned
        }));
      } else {
        console.error("Error fetching comments", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching comments", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreComments = () => {
    fetchComments(post._id, (currentPage[post._id] || 1) + 1);
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;

    try {
      setSubmitting(true);
      // console.log("Adding comment:", commentContent);

      const response = await fetch(`/api/posts/${post._id}/addcomment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ comment: commentContent }),
      });

      if (response.ok) {
        const newComment = await response.json();
        // console.log("Added comment:", newComment);
        setSubmitting(false);

        setCommentsByPostId((prev) => ({
          ...prev,
          [post._id]: [newComment, ...(prev[post._id] || [])],
        }));

        setNumberOfComments((prev) => prev + 1);
        setCommentContent(""); // Clear input field after adding comment
      } else {
        console.error("Failed to add comment", response.statusText);
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    // console.log(commentId);

    try {
      setDeleting(true);
      const response = await fetch(`/api/posts/${post._id}/comments/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: commentId }),
      });

      if (response.ok) {
        await response.json();
        // console.log(result);

        // Update state to remove deleted comment
        setCommentsByPostId((prev) => ({
          ...prev,
          [post._id]: (prev[post._id] || []).filter(
            (comment) => comment._id !== commentId
          ),
        }));

        setNumberOfComments((prev) => prev - 1);
        setDeleting(false);
      } else {
        console.error("Failed to delete comment", response.statusText);
        setDeleting(false);
      }
    } catch (error) {
      setDeleting(false);
      console.error("Error deleting comment:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={handleShow}>
        <MdComment className="buttonIcon" />{" "}
        <span className="buttonTextForBigScreen">Comments</span>{" "}
        {numberOfComments}
      </Button>

      {show && (
        <Modal
          show={show}
          onHide={handleClose}
          centered
          className={Styles.modalMain}
          data-bs-theme={theme}
        >
          <Modal.Header closeButton>
            <Link to={`users/${post.user._id}`} className={Styles.link}>
              <h2>{post.user.username}</h2>
            </Link>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div className={Styles.postContent}>
              <ImageCarousel imageUrls={post.imageUrls} />
              <h1>{post.title}</h1>
              <p>{post.description}</p>
            </div>
            <br />
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Add a comment..."
                aria-label="Add a comment"
                aria-describedby="comment-submit"
                onChange={(e) => setCommentContent(e.target.value)}
                value={commentContent}
                disabled={submitting}
              />
              <Button
                variant="outline-secondary"
                id="comment-submit"
                onClick={handleAddComment}
                disabled={submitting}
              >
                {submitting ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <MdAddComment />
                )}
              </Button>
            </InputGroup>
            {loading ? (
              <LoaderAnimation />
            ) : (
              <>
                <InfiniteScroll
                  dataLength={commentsByPostId[post._id]?.length || 0}
                  next={fetchMoreComments}
                  hasMore={hasMore[post._id] || false}
                  loader={<LoaderAnimation />}
                  endMessage={<p>No more comments to show.</p>}
                  scrollableTarget="scrollableDiv" // Make sure this ID exists
                  className={Styles.commentsContainer}
                >
                  {commentsByPostId[post._id]?.map((comment) => (
                    <div key={comment._id} className={Styles.commentItem}>
                      <div className={Styles.commentHeader}>
                        <Link
                          to={`/users/${comment.user._id}`}
                          className={Styles.link}
                        >
                          <strong>{comment.user.username}</strong>
                        </Link>
                        <div className={Styles.commentHeaderBtns}>
                          <p className={Styles.date}>
                            {formatDistanceToNow(parseISO(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                          {comment.user._id === user?._id && (
                            <Button
                              variant="danger"
                              onClick={() => deleteComment(comment._id)}
                              disabled={deleting}
                              className={Styles.deleteBtn2}
                              size="sm"
                            >
                              {deleting ? (
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                />
                              ) : (
                                <FaTrashAlt />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className={Styles.commentText}>{comment.content}</p>
                    </div>
                  ))}
                </InfiniteScroll>
              </>
            )}
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}

export default CommentButton;
