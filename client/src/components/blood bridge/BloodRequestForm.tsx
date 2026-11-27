import type { FormEvent, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BloodRequestFields from "./BloodRequestFields";
import type { RequestDraft } from "./blood-request-form";
import styles from "./BloodBridge.module.css";

export default function BloodRequestForm({
  data,
  errors,
  onChange,
  onSubmit,
  onCancel,
  pending,
  submitLabel,
  formRef,
}: {
  data: RequestDraft;
  errors: Record<string, string>;
  onChange: (name: keyof RequestDraft, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  pending: boolean;
  submitLabel: string;
  formRef: RefObject<HTMLFormElement | null>;
}) {
  return (
    <form
      ref={formRef}
      noValidate
      aria-busy={pending}
      onSubmit={onSubmit}
      className={styles.drawerForm}
    >
      <div className={styles.drawerBody}>
        {errors.submit && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}
        <p className="mb-4 text-xs text-muted-foreground">Fields marked * are required</p>
        <BloodRequestFields data={data} errors={errors} onChange={onChange} disabled={pending} />
      </div>
      <div className={styles.drawerFooter}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
