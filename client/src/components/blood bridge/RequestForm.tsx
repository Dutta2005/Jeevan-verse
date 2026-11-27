import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@/api/api";
import BloodRequestForm from "./BloodRequestForm";
import {
  emptyRequest,
  requestSchema,
  requestPayload,
  type RequestDraft,
} from "./blood-request-form";
import styles from "./BloodBridge.module.css";

export default function RequestForm() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<RequestDraft>({ ...emptyRequest });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const change = (name: keyof RequestDraft, value: string) => {
    setData((previous) =>
      name === "state"
        ? { ...previous, state: value, district: "", city: "" }
        : { ...previous, [name]: value },
    );
    setErrors((previous) => ({
      ...previous,
      [name]: "",
      ...(name === "state" ? { district: "", city: "" } : {}),
    }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving.current) return;
    const result = requestSchema.safeParse(data);
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    saving.current = true;
    setPending(true);
    setErrors({});
    try {
      const response = await api.post("/blood-requests/create", {
        ...requestPayload(result.data),
        status: "pending",
      });
      const id = response.data?.data?.bloodRequest?._id;
      if (response.status !== 201 || !id) throw new Error("Unexpected response");
      setData({ ...emptyRequest });
      setOpen(false);
      navigate(`/bloodbridge/request/${id}`);
    } catch {
      setErrors({ submit: "Failed to submit the form. Please try again." });
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[role="alert"]')
          ?.scrollIntoView({ block: "nearest" }),
      );
    } finally {
      saving.current = false;
      setPending(false);
    }
  };
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!saving.current) setOpen(next);
      }}
    >
      <SheetTrigger asChild>
        <Button>Create request</Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className={styles.drawer}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          titleRef.current?.focus();
        }}
      >
        <SheetHeader className={styles.drawerHeader}>
          <SheetTitle ref={titleRef} tabIndex={-1} className="outline-none">
            Create a blood request
          </SheetTitle>
          <SheetDescription>Tell volunteers what’s needed and where</SheetDescription>
        </SheetHeader>
        <BloodRequestForm
          data={data}
          errors={errors}
          onChange={change}
          onSubmit={(event) => void submit(event)}
          onCancel={() => setOpen(false)}
          pending={pending}
          submitLabel="Publish request"
          formRef={formRef}
        />
      </SheetContent>
    </Sheet>
  );
}
