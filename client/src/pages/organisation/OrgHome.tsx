import Header from "@/components/organisation/dashboard/Header";
import PastActivities from "@/components/organisation/dashboard/PastActivities";
import OrganizationLandingPage from "@/components/organisation/OrgLandingPage";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

function OrgHome() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
    return (
        <div>
            {isAuthenticated ? (
            <div className="py-7">
                <Header />
                <PastActivities />
            </div>
            ) : (
                <OrganizationLandingPage />
            )}
        </div>
    )
}

export default OrgHome
