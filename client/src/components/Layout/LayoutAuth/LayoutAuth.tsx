import { Outlet } from "react-router-dom";
import logoImage from "../../../assets/logoicon.svg";
import { Link } from "react-router-dom";
import ThemeToggle from "../../Buttons/ThemeToggle";
import Footer from "../../../Footer/Footer";

const LayoutAuth = () => {
  return (
    <>
      <header>
        <Link to="/login" className={`logoContainer`}>
          <img src={logoImage} alt="Logo" className={`logoIconImage`} />
          <span className="logoText">CLUBHOUSE</span>
        </Link>
        <ThemeToggle />
      </header>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default LayoutAuth;
