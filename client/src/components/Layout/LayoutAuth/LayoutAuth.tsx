import { Navigate, Outlet } from "react-router-dom";
import logoImage from "../../../assets/logoicon.svg";
import { Link } from "react-router-dom";
import ThemeToggle from "../../Buttons/ThemeToggle";
import Footer from "../../../Footer/Footer";
import { useAppSelector } from "../../../features/hooks";
import { RootState } from "../../../features/store";

const LayoutAuth = () => {
  const { isAuthenticated, user } = useAppSelector(
    (state: RootState) => state.auth
  );
  if (isAuthenticated && user) return <Navigate to="/" />;
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
