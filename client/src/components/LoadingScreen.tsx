import styles from "./LoadingScreen.module.css";

const LoadingScreen = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Loading Jeevan Verse"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background px-6 text-foreground"
    >
      <p className="text-2xl font-medium">
        <span className="font-samarkan">Jeevan</span> Verse
      </p>
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <div aria-hidden="true" className={styles.track}>
          <span className={styles.segment} />
        </div>
        <p>Loading your page</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
