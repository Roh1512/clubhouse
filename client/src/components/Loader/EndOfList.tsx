import { TbArrowBigUpLineFilled } from "react-icons/tb";
import { Button } from "react-bootstrap";
import Styles from "./EndOfList.module.css";

const EndOfList = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This ensures smooth scrolling
    });
  };

  return (
    <div className={Styles.container}>
      <p>Nothing more to see...</p>
      <Button variant="outline-primary" onClick={scrollToTop}>
        <TbArrowBigUpLineFilled />
      </Button>
    </div>
  );
};

export default EndOfList;
