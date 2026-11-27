import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "@/api/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import BloodRequestForm from "./BloodRequestForm";
import { requestSchema, requestPayload, type RequestDraft } from "./blood-request-form";
import styles from "./BloodBridge.module.css";

export default function EditRequest({
  requestId,
  onSave,
  onCancel,
  onPendingChange,
}: {
  requestId: string;
  onSave: () => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [data, setData] = useState<RequestDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const saving = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const requestKey = requestId;
  const [previousRequestKey, setPreviousRequestKey] = useState(requestKey);
  if (previousRequestKey !== requestKey) {
    setPreviousRequestKey(requestKey);
    setLoading(true);
    setData(null);
    setErrors({});
  }
  useEffect(() => {
    let active = true;

    api
      .get(`/blood-requests/${requestId}`)
      .then((response) => {
        if (response.status !== 200 || !response.data?.data) throw new Error("Unavailable");
        const value = response.data.data;
        if (active)
          setData({
            bloodGroup: value.bloodGroup,
            urgency: value.urgency,
            message: value.message || "",
            phone: value.contactDetails?.phone || "",
            email: value.contactDetails?.email || "",
            state: value.address?.state || "",
            district: value.address?.district || "",
            city: value.address?.city || "",
          });
      })
      .catch(() => {
        if (active) setErrors({ submit: "Failed to load request details." });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [requestId]);
  const change = (name: keyof RequestDraft, value: string) => {
    setData((previous) =>
      previous
        ? name === "state"
          ? { ...previous, state: value, city: "", district: "" }
          : { ...previous, [name]: value }
        : null,
    );
    setErrors((previous) => ({
      ...previous,
      [name]: "",
      ...(name === "state" ? { city: "", district: "" } : {}),
    }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data || saving.current) return;
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
    onPendingChange?.(true);
    setErrors({});
    try {
      const payload = requestPayload(result.data);
      const response = await api.patch(`/blood-requests/update/${requestId}`, {
        ...payload,
        message: payload.message || undefined,
        contactDetails: {
          ...payload.contactDetails,
          email: payload.contactDetails.email || undefined,
        },
      });
      if (response.status !== 200) throw new Error("Unexpected response");
      onSave();
    } catch {
      setErrors({ submit: "Failed to update the request. Please try again." });
    } finally {
      saving.current = false;
      setPending(false);
      onPendingChange?.(false);
    }
  };
  if (loading)
    return (
      <div className={styles.drawerBody} aria-label="Loading request details">
        <div className="flex flex-col gap-5">
          {[1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  if (!data)
    return (
      <div className={styles.drawerBody}>
        <Alert variant="destructive">
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      </div>
    );
  return (
    <BloodRequestForm
      data={data}
      errors={errors}
      onChange={change}
      onSubmit={(event) => void submit(event)}
      onCancel={onCancel}
      pending={pending}
      submitLabel="Save changes"
      formRef={formRef}
    />
  );
}
