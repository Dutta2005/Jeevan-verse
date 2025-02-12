import { Outlet } from "react-router";
import "./App.css";
import { ErrorBoundary } from 'react-error-boundary'
import SomethingWrong from './components/errors/SomethingWrong'
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { useEffect } from "react";
import Navbar from "./components/navbar/Navbar";

function App() {
  const theme = useSelector((state: RootState) => state.theme.theme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ErrorBoundary FallbackComponent={SomethingWrong}>
      <Navbar />
      <div className="pt-16 bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text min-h-screen">
        <Outlet />
      </div>
      </ErrorBoundary>
  );
}

export default App;
