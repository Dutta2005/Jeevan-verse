import OrgLogoutBtn from "@/components/organisation/OrgLogoutBtn";
import { Button } from "@/components/ui/button";
import { RootState } from "@/store/store";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router";

function OrgHome() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
    return (
        <div>
            <h1>Organisation Home</h1>
            <Link to="create">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Post
                </Button>
            </Link>
            {isAuthenticated ? <OrgLogoutBtn /> : <p>You are not logged in</p>}
        </div>
    );
}

export default OrgHome