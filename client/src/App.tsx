import { Outlet } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import type { AppDispatch, RootState } from "./store/store";
import SomethingWrong from "./components/errors/SomethingWrong";
import Navbar from "./components/navbar/Navbar";
import "./App.css";
import { initializeSocket } from "./utils/socket";
import {
  loadNotifications,
  setNotificationOwner,
  setNotificationsLive,
} from "./store/notificationSlice";
import ProtectedLayout from "./components/layouts/ProtectedLayout";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const role = useSelector((state: RootState) => state.auth.role);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const owner = isAuthenticated && role !== "organization" ? userId : undefined;
    dispatch(setNotificationOwner(owner ?? null));
    if (!owner) return;

    const socket = initializeSocket(owner);
    let request: ReturnType<ReturnType<typeof loadNotifications>> | undefined;
    const refresh = () => {
      request?.abort();
      request = dispatch(loadNotifications(owner));
    };
    const updateLiveStatus = (live: boolean) => dispatch(setNotificationsLive(live));
    socket.on("bloodRequest", refresh);
    socket.on("comment", refresh);
    socket.on("roomJoined", () => {
      updateLiveStatus(true);
      refresh();
    });
    socket.on("disconnect", () => updateLiveStatus(false));
    socket.on("connect_error", () => updateLiveStatus(false));
    refresh();
    socket.connect();
    return () => {
      request?.abort();
      socket.disconnect();
    };
  }, [userId, isAuthenticated, role, dispatch]);

  return (
    <ErrorBoundary FallbackComponent={SomethingWrong}>
      {isAuthenticated ? (
        <ProtectedLayout audience={role === "organization" ? "organization" : "individual"}>
          <Outlet />
        </ProtectedLayout>
      ) : (
        <>
          <Navbar />
          <div className="pt-16 bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text min-h-screen">
            <Outlet />
          </div>
        </>
      )}
    </ErrorBoundary>
  );
}

export default App;
