import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import styles from "@/components/dashboard/Dashboard.module.css";
import { ArrowUpRight, Plus } from "lucide-react";

export default function Header() {
  const orgName = useSelector((state: RootState) => state.auth.organization?.name);
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1>{orgName || "Your organization"}</h1>
        <p>Share your work. Keep your community informed.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" asChild>
          <Link to="/organisation/org-profile/0">
            View profile
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild>
          <Link id="organization-create-post" to="/organisation/create">
            <Plus data-icon="inline-start" aria-hidden="true" />
            Create post
          </Link>
        </Button>
      </div>
    </header>
  );
}
