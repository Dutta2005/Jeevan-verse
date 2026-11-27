import { Link, Outlet } from "react-router";
import Sidebar from "../../components/organisation/navbar/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/store/themeSlice";
import ProtectedLayout from "@/components/layouts/ProtectedLayout";

function Layout() {
  const dispatch = useDispatch();
  let isLoggedIn = useSelector((state: RootState) => state.auth.isAuthenticated);
  const role = useSelector((state: RootState) => state.auth.role);
  isLoggedIn = isLoggedIn && role === "organization";
  const theme = useSelector((state: RootState) => state.theme.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    return () => document.body.classList.remove("dark");
  }, [theme]);

  if (isLoggedIn)
    return (
      <ProtectedLayout audience="organization">
        <Outlet />
      </ProtectedLayout>
    );

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-6 sm:px-[5vw]">
          <Link
            to="/organisation"
            aria-label="Jeevan Verse for organizations"
            className="flex shrink-0 flex-col"
          >
            <span className="text-xl font-medium">
              <span className="font-samarkan">Jeevan</span> Verse
            </span>
            <span className="text-[11px] text-muted-foreground">For organizations</span>
          </Link>
          {!isLoggedIn && (
            <nav
              aria-label="Organization services"
              className="hidden items-center gap-8 text-sm lg:flex"
            >
              <a href="/organisation#publishing" className="underline-offset-4 hover:underline">
                Sharing your work
              </a>
              <a
                href="/organisation#getting-started"
                className="underline-offset-4 hover:underline"
              >
                Getting started
              </a>
              <Link to="/" className="underline-offset-4 hover:underline">
                For individuals
              </Link>
            </nav>
          )}
          <div className="flex items-center gap-3 sm:gap-4">
            {!isLoggedIn && (
              <>
                <Link
                  to="/signin"
                  className="hidden text-sm underline-offset-4 hover:underline sm:inline-flex"
                >
                  Sign in
                </Link>
                <Button size="sm" className="hidden sm:inline-flex" asChild>
                  <Link to="/register">Join us</Link>
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => dispatch(toggleTheme())}
            >
              {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
            <div className={isLoggedIn ? undefined : "lg:hidden"}>
              <Sidebar isLoggedIn={isLoggedIn} theme={theme} />
            </div>
          </div>
        </div>
      </header>
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
