import React from "react";
import styles from "../../styles/LoadingOverlay.module.css";
const LoadingOverlay = () => (
  <div className={styles.loadingOverlay}>
    <div className={styles.spinnerWrapper}>
      <div className={styles.spinner}></div>
      <div className={styles.subtitle}>Loading...</div>
    </div>
  </div>
);

export default LoadingOverlay;
