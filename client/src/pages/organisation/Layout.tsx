import { Outlet } from "react-router-dom";
import Sidebar from "../../components/organisation/navbar/Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useEffect } from "react";

function Layout() {
  let isLoggedIn = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const role = useSelector((state: RootState) => state.auth.role);
  isLoggedIn = isLoggedIn && role === "organization";
  const theme = useSelector((state: RootState) => state.theme.theme);
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="bg-light-bg dark:bg-dark-bg dark:text-dark-text min-h-screen">
      <div className="flex justify-between px-2 py-2 fixed w-full top-0 backdrop-blur-md z-50">
        <div className="flex-shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              <span className="font-samarkan">Jeevan</span>
              <span className="font-extrabold"> Verse</span>
            </h1>
            <p className="text-xs text-light-text/75 dark:text-dark-text/70 text-right -mt-2">
              for Organizations
            </p>
          </div>
        </div>
        <Sidebar isLoggedIn={isLoggedIn} theme={theme} />
      </div>
        <div className="pt-16">
          <Outlet />
        </div>
    </div>
  );
}

export default Layout;
