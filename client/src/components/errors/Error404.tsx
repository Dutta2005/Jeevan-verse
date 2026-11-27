import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Link, useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Separator } from "../ui/separator";
import styles from "./Error404.module.css";

function Error404() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const role = useSelector((state: RootState) => state.auth.role);
  const isOrganization = role === "organization" || pathname.startsWith("/organisation/");
  const home = isOrganization ? "/organisation" : "/";

  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <div className={styles.number} aria-hidden="true">
        404
      </div>
      <div className={styles.content}>
        <h1 id="not-found-title">Page not found</h1>
        <p>
          This link may have changed, or the page may no longer be available. Let’s get you
          somewhere familiar.
        </p>
        <div className={styles.actions}>
          <Button asChild>
            <Link to={home}>
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              Back to home
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window.history.state?.idx === "number" && window.history.state.idx > 0)
                void navigate(-1);
              else void navigate(home, { replace: true });
            }}
          >
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Go back
          </Button>
        </div>
        <Separator />
        <nav className={styles.destinations} aria-label="Useful destinations">
          {isOrganization ? (
            <>
              <Link to="/organisation/posts">Community posts</Link>
              <Link to="/organisation">Organization home</Link>
            </>
          ) : (
            <>
              <Link to="/discussions">Community</Link>
              <Link to="/organisation">For organizations</Link>
            </>
          )}
        </nav>
      </div>
    </section>
  );
}

export default Error404;
