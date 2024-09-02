import React, { useState } from "react";
import { Button, Modal, Form, InputGroup, Alert } from "react-bootstrap";
import { useTheme } from "../../context/ThemeContext.tsx/ThemeContext";
import { User } from "../../features/auth/authSlice";
import { useAppDispatch } from "../../features/hooks";
import { loginSuccess } from "../../features/auth/authSlice";
import Styles from "./UpdateProfile.module.css";
import { LiaEdit } from "react-icons/lia";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

type Props = {
  user: User | undefined | null;
};

const UpdateProfile = ({ user }: Props) => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const [show, setShow] = useState(false);

  const [username, setUsername] = useState<string>(user?.username || "");
  const [firstName, setFirstName] = useState<string>(user?.firstName || "");
  const [lastName, setLastName] = useState<string>(user?.lastName || "");
  const [password, setPassword] = useState<string>("");
  const [confirmChanges, setConfirmChanges] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleClose = () => {
    setShow(false);
    setPassword("");
    setError(false);
    setSuccess(false);
    setUsername(user?.username || "");
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setConfirmChanges(false);
  };
  const handleShow = () => {
    setShow(true);
    setPassword("");
    setError(false);
    setSuccess(false);
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setConfirmChanges(false);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
    setSuccess(false);
    setUsername(e.target.value);
  };
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
    setSuccess(false);
    setFirstName(e.target.value);
  };
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
    setSuccess(false);
    setLastName(e.target.value);
  };
  const handelPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
    setSuccess(false);
    setPassword(e.target.value);
  };

  const submitChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(false);
    try {
      setLoading(true);
      const response = await fetch(`/api/users/profile/edit`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, firstName, lastName, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error("Error updating user");
      }
      setSuccess(true);
      setLoading(false);
      dispatch(loginSuccess(result.user._doc));
      setShow(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(true);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleShow}
        className={Styles.editProfileBtn}
      >
        <LiaEdit />
        <span>Edit Profile</span>
      </Button>

      <Modal show={show} onHide={handleClose} data-bs-theme={theme} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitChanges}>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="username">Username</InputGroup.Text>
              <Form.Control
                aria-label="Small"
                aria-describedby="user name"
                value={username}
                onChange={handleUsernameChange}
                disabled={confirmChanges}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="firstname">First name</InputGroup.Text>
              <Form.Control
                aria-label="Small"
                aria-describedby="First name"
                value={firstName}
                onChange={handleFirstNameChange}
                disabled={confirmChanges}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="lastname">Last name</InputGroup.Text>
              <Form.Control
                aria-label="Small"
                aria-describedby="Last name"
                value={lastName}
                onChange={handleLastNameChange}
                disabled={confirmChanges}
              />
            </InputGroup>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setPassword("");
                setConfirmChanges(!confirmChanges);
              }}
            >
              {confirmChanges ? "Edit Content" : "Confirm Changes"}
            </Button>
            {confirmChanges && (
              <>
                <br />
                <br />
                <InputGroup size="sm" className={`mb-3`}>
                  <InputGroup.Text id="assword">Password</InputGroup.Text>
                  <Form.Control
                    aria-label="Small"
                    aria-describedby="password"
                    type="password"
                    value={password}
                    onChange={handelPasswordChange}
                    required
                  />
                </InputGroup>
                <Button
                  className={Styles.updateSubmitBtn}
                  type="submit"
                  variant="success"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Update Changes"}
                </Button>
              </>
            )}
          </Form>
          <br />
          {error && (
            <Alert variant="danger" dismissible>
              Error updating details
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible>
              Update successfull.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UpdateProfile;
