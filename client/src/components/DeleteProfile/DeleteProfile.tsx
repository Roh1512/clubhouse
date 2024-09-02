import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useTheme } from "../../context/ThemeContext.tsx/ThemeContext";
import { FaXmark } from "react-icons/fa6";
import { GiCheckMark } from "react-icons/gi";
import { Alert } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { useAppDispatch } from "../../features/hooks";
import { logout } from "../../features/auth/authSlice";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

const DeleteProfile = () => {
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Use effect to focus the password input when the modal opens
  useEffect(() => {
    if (show && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [show]);

  const deleteProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/profile/delete`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 400 && result.msg) {
          throw new Error(result.msg || "Incorrect password");
        } else {
          throw new Error("Error deleting user profile");
        }
      }
      setLoading(false);
      dispatch(logout());
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(true);
      // Type guard to handle different error types
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed deleting profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
    setErrorMessage("");
    setPassword(e.target.value);
  };

  return (
    <>
      <Button variant="danger" onClick={handleShow}>
        Delete Profile
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        data-bs-theme={theme === "dark" ? "dark" : "light"}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>Password</InputGroup.Text>
            <Form.Control
              aria-label="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              ref={passwordRef}
            />
          </InputGroup>
          {error && <Alert variant="danger">{errorMessage}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            <FaXmark /> No
          </Button>
          <Button variant="danger" disabled={loading} onClick={deleteProfile}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Deleting profile...
              </>
            ) : (
              <>
                <GiCheckMark /> Yes
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteProfile;
