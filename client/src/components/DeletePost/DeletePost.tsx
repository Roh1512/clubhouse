import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Styles from "./DeletePost.module.css";
import { Spinner } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext.tsx/ThemeContext";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

type Props = {
  postId: string;
  setDeleted: React.Dispatch<React.SetStateAction<boolean>>;
};

const DeletePost = ({ postId, setDeleted }: Props) => {
  const { theme } = useTheme();
  const [deleting, setDeleting] = useState<boolean>(false);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const deletePost = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/posts/${postId}/delete`, {
        method: "Delete",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: postId }),
      });
      await response.json();
      // console.log(result);
      if (response.ok) {
        setDeleted(true);
      }
    } catch (error) {
      console.error(error);
      setDeleted(false);
      setDeleting(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="danger"
        className={Styles.deleteBtn}
        disabled={deleting}
        onClick={handleShow}
        type="button"
      >
        <FaTrashAlt />
      </Button>

      <Modal show={show} onHide={handleClose} data-bs-theme={theme}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are You sure you want to delete this post?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
          <Button variant="danger" onClick={deletePost}>
            {deleting ? (
              <Spinner animation="border" variant="light" size="sm" />
            ) : (
              "Yes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeletePost;
