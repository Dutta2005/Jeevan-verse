import { useSelector } from "react-redux"
import { RootState } from "../../store/store"

function PublicRoutes({ children, role="any" }: any) {
    const isLoggedIn = useSelector((state: RootState) => state.auth.isAuthenticated)
    const roleStore = useSelector((state: RootState) => state.auth.role)
    if(isLoggedIn === false || roleStore !== role) return children
}

export default PublicRoutes
 