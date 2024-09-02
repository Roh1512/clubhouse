import React from "react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Styles from "./ErrorElement.module.css";

const ErrorElement: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };
  const goHome = () => {
    navigate("/");
  };

  return (
    <div
      style={{ padding: "20px", textAlign: "center" }}
      className={Styles.container}
    >
      <h1>Oops! Something went wrong.</h1>
      {isRouteErrorResponse(error) ? (
        <div>
          <p>Status: {error.status}</p>
          <p>{error.statusText}</p>
          {error.data?.message && <p>{error.data.message}</p>}
        </div>
      ) : (
        <p>Unexpected error occurred.</p>
      )}
      <Button onClick={handleGoBack} variant="primary">
        Go Back
      </Button>
      <br />
      <Button onClick={goHome}>Go home</Button>
    </div>
  );
};

export default ErrorElement;
