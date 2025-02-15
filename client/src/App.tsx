// App.tsx
import { Outlet } from "react-router"
import { ErrorBoundary } from 'react-error-boundary'
import { useSelector, useDispatch } from "react-redux"
import { useEffect } from "react"
import { RootState } from "./store/store"
import SomethingWrong from './components/errors/SomethingWrong'
import Navbar from "./components/navbar/Navbar"
import "./App.css"
import { initializeSocket } from "./utils/socket"
import { addNotification } from "./store/notificationSlice"

function App() {
  const dispatch = useDispatch()
  const theme = useSelector((state: RootState) => state.theme.theme)
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  useEffect(() => {
    if (!userId) return;
    
    const socket = initializeSocket(userId);

    socket.on("bloodRequest", (notification) => {      
      dispatch(addNotification(notification));
    });

    socket.on("comment", (notification) => {
      dispatch(addNotification(notification));
    })

    return () => {
      socket.disconnect();
    };
  }, [userId, dispatch]);

  return (
    <ErrorBoundary FallbackComponent={SomethingWrong}>
      <Navbar />
      {/* <Suspense fallback={<LoadingScreen />}> */}
      <div className="pt-16 bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text min-h-screen">
        <Outlet />
      </div>
      {/* </Suspense> */}
    </ErrorBoundary>
  )
}

export default App