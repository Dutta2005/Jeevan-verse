import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Navigate } from "react-router";
import { useToast } from "../../hooks/use-toast";
import { useEffect } from "react";

function Protected({ children, role = "any" }: any) {
    const { toast } = useToast();  
    const isLoggedIn = useSelector((state: RootState) => state.auth.isAuthenticated);
    const roleStore = useSelector((state: RootState) => state.auth.role);

    const shouldRedirect = !(isLoggedIn && (role === "any" || roleStore === role));

    useEffect(() => {
        if (shouldRedirect && window.location.pathname !== "/") {
            toast({
                title: "Unauthorized",
                description: "You need to sign in to access this page",
                variant: "destructive",
                duration: 3000
            });
        }
    }, [shouldRedirect, toast]);

    if (!isLoggedIn && window.location.pathname === "/") return children;
    if (!shouldRedirect) return children;

    return <Navigate to={role === "organization" ? "/signin" : "/login"} replace />;
}


export default Protected;