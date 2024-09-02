import Styles from "./ChangePassword.module.css";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { InputGroup, Form, Alert } from "react-bootstrap";
import { useTheme } from "../../context/ThemeContext.tsx/ThemeContext";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

const ChangePassword = () => {
  const [show, setShow] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errMessage, setErrorMessage] = useState<string>("");
  const { theme } = useTheme();

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setSuccess(false);
    setError(false);
    setErrorMessage("");
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const currentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
    setSuccess(false);
    setErrorMessage("");
    setCurrentPassword(e.target.value);
  };
  const newPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
    setSuccess(false);
    setErrorMessage("");
    setNewPassword(e.target.value);
  };
  const confirmNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
    setSuccess(false);
    setErrorMessage("");
    setConfirmNewPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setError(false);
    setSuccess(false);
    setErrorMessage("");
    e.preventDefault();
    if (newPassword === "" || confirmNewPassword === "") {
      setError(true);
      setErrorMessage("Please fill in all fields");
      console.log("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(true);
      console.log("Passwords do not match");
      setErrorMessage("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/users/profile/editpassword`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      await response.json();
      // console.log(result);
      if (!response.ok) {
        throw new Error("Error chaning password");
      }
      setSuccess(true);
      setError(false);
      setErrorMessage("");
      handleClose();
    } catch (error) {
      console.error(error);
      setErrorMessage("Error changing password");
      setLoading(false);
      setError(true);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={handleShow}>
        Change password
      </Button>

      <Modal show={show} onHide={handleClose} data-bs-theme={theme}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => handleSubmit(e)}>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="currentPassword">
                Current Password
              </InputGroup.Text>
              <Form.Control
                aria-label="Small"
                aria-describedby="current password"
                value={currentPassword}
                onChange={currentPasswordChange}
                type="password"
              />
            </InputGroup>
            <br />
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="newPassword">New Password</InputGroup.Text>
              <Form.Control
                aria-label="Small"
                aria-describedby="new password"
                value={newPassword}
                onChange={newPasswordChange}
                type="password"
              />
            </InputGroup>
            <br />
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="newPassword">
                Confirm New Password
              </InputGroup.Text>
              <Form.Control
                aria-label="Small"
                aria-describedby="confirm new password"
                value={confirmNewPassword}
                onChange={confirmNewPasswordChange}
                type="password"
              />
            </InputGroup>
            {newPassword === "" || confirmNewPassword === "" ? (
              ""
            ) : newPassword !== confirmNewPassword ? (
              <p className={Styles.textDanger}>Passwords do not match</p>
            ) : (
              <p className={Styles.textSuccess}>Passwords match</p>
            )}
            <br />
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Change Password"}
            </Button>
          </Form>
          <br />
          {error && errMessage && (
            <Alert variant="danger" dismissible>
              {errMessage}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible>
              Password updated successfully
            </Alert>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ChangePassword;
