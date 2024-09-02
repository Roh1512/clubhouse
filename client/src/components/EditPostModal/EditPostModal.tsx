import { /* useEffect, */ useState } from "react";
import { Post } from "../../types/Post";
// import type { ImageResponse } from "../../components/ImageCarousel/ImageCarousel";
import { Modal, Button, Alert, Form, Spinner } from "react-bootstrap";
import { useTheme } from "../../context/ThemeContext.tsx/ThemeContext";
import { LiaEdit } from "react-icons/lia";
import Styles from "./EditPostModal.module.css";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

type Props = {
  post: Post;
  onPostUpdated: (updatedPost: Post) => void;
};

const EditPostModal = ({ post, onPostUpdated }: Props) => {
  const { theme } = useTheme();
  const [show, setShow] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(post.title);
  const [description, setDescription] = useState<string>(post.description);
  const [images, setImages] = useState<FileList | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);

  /* useEffect(() => {
    setSuccess(false)
    setFailed(false)
  },[]) */

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setFailed(false);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (images) {
      Array.from(images).forEach((image) => {
        formData.append("images", image);
      });
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${post._id}/edit`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to edit post");
      }
      const result = await response.json();
      // console.log(result.populatedPost);
      setTitle(result.populatedPost.title);
      setDescription(result.populatedPost.description);
      setImages(null);
      setLoading(false);
      setSuccess(true);
      setFailed(false);
      onPostUpdated(result.populatedPost);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setFailed(true);
      setSuccess(false);
    }
  };

  return (
    <>
      <Button variant="info" onClick={handleShow} className={Styles.editBtn1}>
        <LiaEdit className={Styles.editIcon} />
        <span className="buttonTextForBigScreen">Edit</span>
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        data-bs-theme={theme === "dark" ? "dark" : "light"}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {failed && <Alert variant="danger">Failed to edit post</Alert>}
          {success && <Alert variant="success">Post is Edited</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="postTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSuccess(false);
                  setFailed(false);
                }}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group controlId="postDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setSuccess(false);
                  setFailed(false);
                }}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group controlId="postImages">
              <Form.Label>Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
            </Form.Group>
            <br />
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  "Editing Post..."
                </>
              ) : (
                "Edit Post"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditPostModal;
