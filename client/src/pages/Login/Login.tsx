import React, { useState } from "react";
import { loginFailure, loginSuccess } from "../../features/auth/authSlice";
import { useAppDispatch } from "../../features/hooks";
import { Link, useNavigate } from "react-router-dom";

import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";
import ErrorMessage from "../../components/ErrorMessage";
import { v4 as uuidv4 } from "uuid";
import { AuthErrorType } from "../../features/auth/authSlice";
import Spinner from "react-bootstrap/Spinner";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

const LoginComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState<AuthErrorType[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await fetch(`/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const result = await data.json();
      // console.log(result);
      if (data.ok) {
        dispatch(loginSuccess(result.user));
        setIsLoading(false);
        setUsername("");
        setPassword("");
        navigate("/");
        return;
      } else {
        setErrorMessages(result.errors);
      }
    } catch (error) {
      dispatch(loginFailure());
      // console.log("Login Err: ", error);
      setIsLoading(false);
      if (Array.isArray(error)) {
        setErrorMessages(error);
      } else {
        setErrorMessages([
          {
            msg: "Something went wrong",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setUsername("");
      setPassword("");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={`loginForm`}>
        <h1>Login Here</h1>
        <FloatingLabel controlId="username" label="Username" className="mb-3">
          <Form.Control
            type="text"
            placeholder="Enter username here"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrorMessages([]);
            }}
            className="custom-input"
            required
          />
        </FloatingLabel>
        <FloatingLabel controlId="password" label="Password" className="mb-3">
          <Form.Control
            type="password"
            placeholder="Enter password here"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessages([]);
            }}
            className="custom-input"
            required
          />
        </FloatingLabel>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="loginButton"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner animation="border" variant="light" size="sm" />{" "}
              <span>Loading...</span>
            </>
          ) : (
            "Login"
          )}
        </Button>
        <div className="errorDiv">
          {errorMessages &&
            errorMessages.map((error) => (
              <ErrorMessage key={uuidv4()} message={error?.msg} />
            ))}
        </div>
      </form>
      <p className="auth-paragraph">
        Do not have an Account?{" "}
        <span>
          <Link to="/signup">
            <Button variant="success">Sign Up</Button>
          </Link>
        </span>
      </p>
    </>
  );
};

export default LoginComponent;
