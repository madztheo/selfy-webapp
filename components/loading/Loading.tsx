import Lottie from "lottie-react";
import loader from "@/animations/loading.json";
import styles from "./Loading.module.scss";
import cn from "classnames";

export function Loading({ className = "" }) {
  return (
    <div className={cn(styles.container, className)}>
      <Lottie
        className={styles.animation}
        animationData={loader}
        loop
        autoplay
      />
    </div>
  );
}
