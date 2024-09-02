import { Outlet, NavLink } from "react-router-dom";
import Styles from "./AppLayout.module.css";
import { FaUser } from "react-icons/fa";
import { HiHome } from "react-icons/hi";
import { PiUsersThreeFill } from "react-icons/pi";

const AppLayout = () => {
  return (
    <>
      <nav className={Styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${Styles.navLink} ${Styles.active}` : Styles.navLink
          }
        >
          <HiHome />
          <span className={Styles.navText}>Posts</span>
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) =>
            isActive ? `${Styles.navLink} ${Styles.active}` : Styles.navLink
          }
        >
          <PiUsersThreeFill />
          <span className={Styles.navText}>Users</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? `${Styles.navLink} ${Styles.active}` : Styles.navLink
          }
        >
          <FaUser />
          <span className={Styles.navText}>Profile</span>
        </NavLink>
      </nav>
      <Outlet />
    </>
  );
};

export default AppLayout;
