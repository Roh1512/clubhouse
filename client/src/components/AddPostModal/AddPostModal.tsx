import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Post } from "../../types/Post";
import { useTheme } from "../../context/ThemeContext.tsx/ThemeContext";
import { Spinner } from "react-bootstrap";
import { RiImageAddFill } from "react-icons/ri";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

interface AddPostModalProps {
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>; // Type for setPosts
}
import Styles from "./AddPostModal.module.css";

const AddPostModal: React.FC<AddPostModalProps> = ({ setPosts }) => {
  const { theme } = useTheme();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleAddPost = async (formData: FormData): Promise<void> => {
    try {
      const response = await fetch(`/api/posts/create`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to add post");
      }

      // Handle the response, e.g., refresh the post list
      const result = await response.json();
      // console.log(result.populatedPost);

      // Use the newly created post object from the result
      setPosts((prev) => [result.populatedPost, ...prev]);
    } catch (error) {
      console.log(error);
      throw new Error("Error adding post");
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }
    if (!images || images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    if (images.length > 10) {
      setError("You can only upload up to 10 images.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    try {
      await handleAddPost(formData);
      setTitle("");
      setDescription("");
      setImages(null);
      handleCloseModal();
    } catch (error) {
      console.error("Error adding post:", error);
      setError("Failed to add post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImages(e.target.files);
  };

  return (
    <>
      <Button
        variant="success"
        onClick={handleShowModal}
        className={Styles.addPostBtn1}
        size="lg"
      >
        <RiImageAddFill /> <span>Add New Post</span>
      </Button>

      <Modal
        data-bs-theme={theme === "dark" ? "dark" : "light"}
        show={showModal}
        onHide={handleCloseModal}
        className={Styles.modalContainer}
        backdrop={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit} className={Styles.addPostForm}>
            <Form.Group controlId="postTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group controlId="postDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group controlId="postImages">
              <Form.Label>Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
            </Form.Group>

            <Button
              variant="success"
              type="submit"
              disabled={loading}
              className={Styles.addPostBtn2}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  "Adding Post..."
                </>
              ) : (
                "Add Post"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddPostModal;
