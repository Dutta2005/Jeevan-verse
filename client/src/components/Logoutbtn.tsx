import { getErrorMessage } from "@/lib/error";
import { LogOut } from "lucide-react";
import { api } from "../api/api";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router";
import { useToast } from "../hooks/use-toast";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Logoutbtn(props: ComponentProps<"button">) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const signOut = async () => {
    try {
      const response = await api.post("/users/logout");
      dispatch(logout());
      if (response.status === 200) {
        toast({
          title: "Logout Successful",
          description: "You have successfully logged out.",
          variant: "success",
          duration: 3000,
        });
      }
      navigate("/", { replace: true });
    } catch (error: unknown) {
      dispatch(logout());
      toast({
        title: "Something went wrong",
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

export default Logoutbtn;
