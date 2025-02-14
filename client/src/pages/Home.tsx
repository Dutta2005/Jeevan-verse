import { useSelector } from "react-redux"
import LandingPage from "./LandingPage"
import { RootState } from "../store/store"
import { useNavigate } from "react-router"
import { useEffect } from "react"

function Home() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
    const role = useSelector((state: RootState) => state.auth.role)
    const navigate = useNavigate()
    
    useEffect(() => {
        if (isAuthenticated && role === "organization") {
            navigate("/organisation")
        }
    }, [isAuthenticated, role, navigate])

    return (
        <div>
            
            {isAuthenticated ? (
                <p>Hello</p>
            ) : (
                <LandingPage />
            )}
        </div>
    )
}

export default Home