import { currentUser, User } from "../../features/auth/authSlice";
import { useAppSelector } from "../../features/hooks";
import { formatDistanceToNow } from "date-fns";
import Styles from "./ProfilePage.module.css";
import LogoutComponent from "../../components/LogoutComponent";
import PostsList from "./PostsList";
import DeleteProfile from "../../components/DeleteProfile/DeleteProfile";
import UpdateProfile from "../../components/UpdateProfileBtn/UpdateProfile";
import ChangePassword from "../../components/ChangePassword/ChangePassword";

const ProfilePage = () => {
  const user: User | undefined | null = useAppSelector(currentUser);

  const formattedDate =
    user?.createdAt && !isNaN(new Date(user.createdAt).getTime())
      ? formatDistanceToNow(new Date(user.createdAt), {
          addSuffix: true,
        })
      : "Date not available"; // Handle the case where the date is invali

  return (
    <div>
      <div className={`${Styles.profileDiv}`}>
        <h1 className={Styles.profilePageHeading}>Profile Page</h1>
        <p className={Styles.fullName}>
          {user?.firstName} {user?.lastName}
        </p>
        <p>
          <b>Username:</b>{" "}
          <span className={Styles.username}>{user?.username}</span>
        </p>
        <p>
          <b>Profile created</b>{" "}
          <span className={Styles.date}>{formattedDate}</span>
        </p>
        <div className={Styles.buttonContainer}>
          <DeleteProfile />
          <LogoutComponent />
          <UpdateProfile user={user} />
          <ChangePassword />
        </div>
      </div>
      <PostsList />
    </div>
  );
};

export default ProfilePage;
