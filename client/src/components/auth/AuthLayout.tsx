import { useEffect, type ReactNode } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Moon, Sun } from "lucide-react";
import type { RootState } from "@/store/store";
import { toggleTheme } from "@/store/themeSlice";
import { Button } from "../ui/button";
import styles from "./AuthLayout.module.css";

type AuthLayoutProps = {
  audience: "individual" | "organization";
  mode: "login" | "signup";
  title: string;
  description: string;
  children: ReactNode;
};

function AuthLayout({ audience, mode, title, description, children }: AuthLayoutProps) {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const dispatch = useDispatch();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const individualRoute = mode === "login" ? "/login" : "/signup";
  const organizationRoute = mode === "login" ? "/signin" : "/register";

  return (
    <div className={styles.layout}>
      <aside className={styles.brandPanel} aria-label="About Jeevan Verse">
        <Link to={audience === "organization" ? "/organisation" : "/"} className={styles.wordmark}>
          <span className="font-samarkan">Jeevan</span> Verse
        </Link>
        <div className={styles.brandCopy}>
          <h2>
            {audience === "organization" ? (
              <>
                Your updates
                <br />A wider community
              </>
            ) : (
              <>
                Health support
                <br />
                goes both ways
              </>
            )}
          </h2>
          <p>
            {audience === "organization"
              ? "Profiles · Health updates · Community"
              : "Umeed · Blood Bridge · Community"}
          </p>
        </div>
        <img
          src={
            audience === "organization"
              ? "/images/community-conversation.webp"
              : "/images/community-together.webp"
          }
          alt={
            audience === "organization"
              ? "Friends spending time together outdoors"
              : "Friends sharing a laugh outdoors"
          }
          width="1000"
          height="667"
          className={styles.photo}
        />
        <Link to={audience === "organization" ? "/organisation" : "/"} className={styles.backLink}>
          Back to Jeevan Verse
        </Link>
      </aside>
      <main className={styles.main}>
        <div className={styles.topbar}>
          <Link
            to={audience === "organization" ? "/organisation" : "/"}
            className={styles.mobileWordmark}
          >
            <span className="font-samarkan">Jeevan</span> Verse
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>
        </div>
        <section className={styles.formPanel} aria-labelledby="auth-title">
          <nav className={styles.accountNav} aria-label="Account type">
            <Link
              to={individualRoute}
              aria-current={audience === "individual" ? "page" : undefined}
            >
              Individual
            </Link>
            <Link
              to={organizationRoute}
              aria-current={audience === "organization" ? "page" : undefined}
            >
              Organization
            </Link>
          </nav>
          <header className={styles.formHeader}>
            <h1 id="auth-title">{title}</h1>
            <p>{description}</p>
          </header>
          {children}
        </section>
      </main>
    </div>
  );
}

export { AuthLayout };
