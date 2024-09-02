import React, { useState } from "react";
import { logout } from "../features/auth/authSlice";
import { useAppDispatch } from "../features/hooks";
import { Button } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { CgLogOut } from "react-icons/cg";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

const LogoutComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/logout`, {
        credentials: "include",
        method: "GET",
      });
      await response.json();

      if (!response.ok) {
        throw new Error("Error logging out");
      }

      dispatch(logout());
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="warning"
      onClick={handleLogout}
      disabled={loading}
      className="logoutButton"
    >
      {loading ? (
        <>
          <Spinner animation="border" variant="light" size="sm" /> Loading...
        </>
      ) : (
        <>
          <CgLogOut className="buttonIcon" />
          Logout
        </>
      )}
    </Button>
  );
};

export default LogoutComponent;
