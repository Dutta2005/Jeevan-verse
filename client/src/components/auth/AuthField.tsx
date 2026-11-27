import type { ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

function AuthField({
  id,
  label,
  error,
  description,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}

export { AuthField };
