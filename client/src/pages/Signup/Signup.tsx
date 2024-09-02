import { useState } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import ErrorMessage from "../../components/ErrorMessage";
import { v4 as uuidv4 } from "uuid";
import type { AuthErrorType } from "../../features/auth/authSlice";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

const Signup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [membershipStatus, setMembershipStatus] = useState<"free" | "paid">(
    "free"
  );

  const [errorMessages, setErrorMessages] = useState<AuthErrorType[]>([]);

  const [signupLoading, setSignupLoading] = useState<boolean>(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMessages([]);
      setSignupLoading(true);
      const response = await fetch(`/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          password,
          membershipStatus,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setSignupLoading(false);
        navigate("/login");
        return;
      } else {
        setErrorMessages(data.errors);
      }
    } catch (error) {
      console.log("Signup Error: ", error);
      setSignupLoading(false);
    } finally {
      setSignupLoading(false);
      setFirstName("");
      setLastName("");
      setUsername("");
      setPassword("");
    }
  };

  return (
    <>
      <form className="loginForm" onSubmit={handleSignup}>
        <h1>Sign Up Here</h1>
        <FloatingLabel
          controlId="firstName"
          label="First name"
          className="mb-3"
        >
          <Form.Control
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrorMessages([]);
            }}
            className="custom-input"
            required
          />
        </FloatingLabel>
        <FloatingLabel controlId="lastName" label="Last name" className="mb-3">
          <Form.Control
            type="text"
            placeholder="last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setErrorMessages([]);
            }}
            className="custom-input"
            required
          />
        </FloatingLabel>
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
        <Form.Label htmlFor="membership">Membership status</Form.Label>
        <Form.Select
          aria-label="Membership status"
          className="selectInput"
          id="membership"
          required
        >
          <option
            value="free"
            onSelect={() => {
              setMembershipStatus("free");
              setErrorMessages([]);
            }}
            className="custom-input"
          >
            Free
          </option>
          <option
            value="paid"
            onClick={() => setMembershipStatus("paid")}
            disabled
          >
            Paid
          </option>
        </Form.Select>
        <Button
          type="submit"
          variant="success"
          size="lg"
          className="loginButton"
          disabled={signupLoading}
        >
          {signupLoading ? (
            <>
              <Spinner animation="border" variant="light" size="sm" />
              <span>Registering...</span>
            </>
          ) : (
            "Sign Up"
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
        Have an Account?{" "}
        <span>
          <Link to="/login">
            <Button variant="primary">Log in</Button>
          </Link>
        </span>
      </p>
    </>
  );
};

export default Signup;
