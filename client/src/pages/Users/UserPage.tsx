import { useParams } from "react-router-dom";
import type { User } from "../../features/auth/authSlice";
import { useEffect, useState } from "react";
import LoaderAnimation from "../../components/Loader/LoaderAnimation";
import { formatDistanceToNow } from "date-fns";
import Styles from "./Users.module.css";
import PostsByUser from "./PostsByUser/PostsByUser";
import BackButton from "../../components/Buttons/BackButton/BackButton";

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

const UserPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { userId } = useParams<{ userId?: string }>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!userId) return;

      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        const data = await response.json();
        const userData = data._doc || data;
        setUser(userData);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <>
      {loading ? (
        <LoaderAnimation />
      ) : (
        <>
          {user ? (
            <>
              <BackButton />
              <div className={`${Styles.profileDiv}`}>
                <h2 className={Styles.fullName}>
                  {user.firstName} {user.lastName}
                </h2>
                <p>
                  <b>Username:</b>{" "}
                  <span className={Styles.username}>{user.username}</span>
                </p>
                <p>
                  <b>Profile created</b>{" "}
                  <span className={Styles.date}>
                    {user.createdAt
                      ? formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })
                      : "Unknown date"}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <p>User not found</p>
          )}
          {userId && <PostsByUser userid={userId} />}
        </>
      )}
    </>
  );
};

export default UserPage;
