import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Alert, Form } from "react-bootstrap";
import type { User } from "../../features/auth/authSlice";
import { Link } from "react-router-dom";
import LoaderAnimation from "../../components/Loader/LoaderAnimation";
import Styles from "./Users.module.css";
import { PiUserCircleBold } from "react-icons/pi";
import useDebounce from "../../hooks/useDebounce"; // Adjust the import according to your file structure

interface UsersResponse {
  all_users: User[];
  totalPages: number;
  currentPage: number;
}

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 700); // Debounce with 500ms delay

  useEffect(() => {
    // Reset page and users when search query changes
    setUsers([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchUsers(1, debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const fetchUsers = async (page: number, search: string) => {
    try {
      const response = await fetch(
        `/api/users?page=${page}&limit=20&search=${encodeURIComponent(search)}`,
        {
          credentials: "include",
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: UsersResponse = await response.json();

      if (data.all_users.length > 0) {
        setUsers((prevUsers) => {
          // Remove duplicates by filtering out users that already exist in the list
          const newUsers = data.all_users.filter(
            (user) => !prevUsers.some((u) => u._id === user._id)
          );
          return [...prevUsers, ...newUsers];
        });
        setCurrentPage(page);
      }

      if (page >= data.totalPages) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const fetchMoreUsers = () => {
    fetchUsers(currentPage + 1, debouncedSearchQuery);
  };

  return (
    <div>
      <Form.Group controlId="search">
        <Form.Control
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}
      <div>
        <InfiniteScroll
          dataLength={users.length}
          next={fetchMoreUsers}
          hasMore={hasMore}
          loader={<LoaderAnimation />}
          endMessage={<p>No more users</p>}
          className={Styles.usersListContainer}
        >
          {users.map((user) => (
            <Link
              key={user._id}
              to={`/users/${user._id}`}
              className={Styles.userLink}
            >
              <PiUserCircleBold className={Styles.userIcon} />
              <p className={Styles.username}>{user.username}</p>
              {/* Add other user details as needed */}
            </Link>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Users;
