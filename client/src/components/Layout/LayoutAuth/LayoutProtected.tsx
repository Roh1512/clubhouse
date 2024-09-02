import { Outlet } from "react-router-dom";
import logoImage from "../../../assets/logoicon.svg";
import { Link } from "react-router-dom";
import ThemeToggle from "../../Buttons/ThemeToggle";
import LogoutComponent from "../../LogoutComponent";

const LayoutProtected = () => {
  return (
    <>
      <header id="header">
        <Link to="/" className={`logoContainer`}>
          <img src={logoImage} alt="Logo" className={`logoIconImage`} />
        </Link>
        <nav className="appNav">
          <LogoutComponent />
          <ThemeToggle />
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default LayoutProtected;
