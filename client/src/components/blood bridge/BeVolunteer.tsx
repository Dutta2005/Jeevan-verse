import { useRef, useState } from "react";
import { getErrorMessage } from "@/lib/error";
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
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { api } from "@/api/api";
import { useToast } from "@/hooks/use-toast";

export default function BeVolunteer({ id, onJoined }: { id: string; onJoined?: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saving = useRef(false);
  const submit = async (canShareDetails: boolean) => {
    if (saving.current) return;
    saving.current = true;
    setPending(true);
    setError(null);
    try {
      const response = await api.post(`/blood-requests/${id}/volunteer`, { canShareDetails });
      if (response.status === 200) {
        setJoined(true);
        setOpen(false);
        toast({
          title: "Volunteer registered",
          description: "You are now a volunteer for this request",
          variant: "success",
          duration: 2000,
        });
        onJoined?.();
      } else setError("Could not confirm your registration. Please try again.");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Could not register as a volunteer");
      setError(message);
      toast({
        title: "Could not volunteer",
        description: message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      saving.current = false;
      setPending(false);
    }
  };
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!saving.current) {
          setOpen(value);
          setError(null);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button disabled={joined}>{joined ? "You volunteered" : "Be a Volunteer"}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Volunteer for this request</AlertDialogTitle>
          <AlertDialogDescription>
            Choose whether other members viewing the request can see your phone and email. Your name
            remains visible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter className="flex-wrap gap-2">
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant="outline" disabled={pending} onClick={() => void submit(false)}>
            Continue without sharing
          </Button>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              void submit(true);
            }}
          >
            {pending ? "Saving…" : "Share"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
