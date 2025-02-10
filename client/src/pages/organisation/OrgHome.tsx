import OrgLogoutBtn from "@/components/organisation/OrgLogoutBtn";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

function OrgHome() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
    return (
        <div>
            <h1>Organisation Home</h1>
            {isAuthenticated ? <OrgLogoutBtn /> : <p>You are not logged in</p>}
        </div>
    );
}

export default OrgHome