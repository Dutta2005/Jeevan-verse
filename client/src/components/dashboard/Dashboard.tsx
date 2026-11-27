import PersonalDetails from "./PersonalDetails";
import { LatestsPosts } from "./LatestsPosts";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.columns}>
        <section aria-label="Your community activity">
          <LatestsPosts />
        </section>
        <aside aria-label="Your profile">
          <PersonalDetails />
        </aside>
      </div>
      <p className={styles.footnote}>
        Umeed and community discussions offer information and support. For medical advice, speak
        with a qualified clinician.
      </p>
    </div>
  );
}
