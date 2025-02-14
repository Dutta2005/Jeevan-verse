// App.tsx
import { Outlet } from "react-router"
import { ErrorBoundary } from 'react-error-boundary'
import { useSelector } from "react-redux"
import { Suspense, useEffect } from "react"
import { RootState } from "./store/store"
import SomethingWrong from './components/errors/SomethingWrong'
import Navbar from "./components/navbar/Navbar"
import "./App.css"
import {PuffLoader} from "react-spinners"
// import LoadingScreen from "./components/LoadingScreen"

function App() {
  const theme = useSelector((state: RootState) => state.theme.theme)

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return (
    <ErrorBoundary FallbackComponent={SomethingWrong}>
      <Navbar />
      <Suspense fallback={<div className='h-screen flex justify-center items-center'><PuffLoader color="red" /></div>}>
      <div className="pt-16 bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text min-h-screen">
        <Outlet />
      </div>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App