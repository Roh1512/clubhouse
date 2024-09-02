import { useNavigate } from "react-router-dom";
import Styles from "./BackButton.module.css";
import { TiArrowBack } from "react-icons/ti";
const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={Styles.backButton}
      onClick={() => navigate(-1)}
    >
      <TiArrowBack />
    </button>
  );
};

export default BackButton;
