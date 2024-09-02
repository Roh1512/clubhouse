import styles from "./LoaderAnimation.module.css";

const LoaderAnimation = () => {
  return (
    <>
      <div className={styles.loaderContainer}>
        <div className={styles.spinner}></div>
      </div>
    </>
  );
};

export default LoaderAnimation;
