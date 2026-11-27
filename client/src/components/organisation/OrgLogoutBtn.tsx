import { getErrorMessage } from "@/lib/error";
import { LogOut } from "lucide-react";
import { api } from "../../api/api";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { useNavigate } from "react-router";
import { useToast } from "../../hooks/use-toast";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function OrgLogoutBtn(props: ComponentProps<"button">) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const signOut = async () => {
    try {
      const response = await api.post("/organizations/logout");
      if (response.status === 200) {
        dispatch(logout());
        toast({
          title: "Logout Successful",
          description: "You have successfully logged out.",
          variant: "success",
          duration: 3000,
        });
        navigate("/organisation", { replace: true });
      }
    } catch (error: unknown) {
      toast({
        title: "Logout Failed",
        description: getErrorMessage(error, "Something went wrong"),
        variant: "destructive",
        duration: 2000,
      });
    }
  };
  return (
    <button
      {...props}
      className={cn(
        "flex h-9 w-full items-center justify-center gap-2 rounded-md text-sm text-destructive hover:bg-muted",
        props.className,
      )}
      onClick={signOut}
    >
      <span>Logout</span>
      <LogOut className="w-5 h-5" />
    </button>
  );
}

export default OrgLogoutBtn;
