import {
    AlertDialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { api } from "../../api/api";
import { useToast } from "../../hooks/use-toast";
import { X } from "lucide-react";

export default function BeVolunteer({ id }: { id: string }) {
  const { toast } = useToast();
  const handleSubmit = async (canShare: boolean) => {
    try {
      const res = await api.post(`/blood-requests/${id}/volunteer`, {
        canShareDetails: canShare,
      });
      if (res.status === 200) {
        toast({
          title: "Success",
          description: "You are now a volunteer for this request",
          variant: "success",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data.message || "Something went wrong",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          variant="ghost"
          className="text-accent dark:text-accent font-semibold"
        >
          Be a Volunteer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark:bg-dark-bg">
        <AlertDialogHeader>
          <AlertDialogCancel className="absolute top-4 right-4 dark:text-dark-text">
            <X />
          </AlertDialogCancel>
          <AlertDialogTitle className="dark:text-dark-text">
            Share Details
          </AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to share your details with this person?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogAction onClick={() => handleSubmit(false)} >
            Continue without sharing
          </AlertDialogAction>
          <AlertDialogAction onClick={() => handleSubmit(true)}>
            Share
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
