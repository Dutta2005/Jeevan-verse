import Header from "@/components/organisation/dashboard/Header";
import PastActivities from "@/components/organisation/dashboard/PastActivities";
import OrganizationLandingPage from "@/components/organisation/OrgLandingPage";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import styles from "@/components/dashboard/Dashboard.module.css";
import { Outlet } from "react-router";

function OrgHome() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const role = useSelector((state: RootState) => state.auth.role);
  return (
    <div>
      {isAuthenticated && role === "organization" ? (
        <div className={styles.page}>
          <Header />
          <PastActivities />
        </div>
      ) : (
        <OrganizationLandingPage />
      )}
      <Outlet />
    </div>
  );
}

export default OrgHome;
