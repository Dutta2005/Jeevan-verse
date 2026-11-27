import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

// The shadcn field primitives used by this client, adapted to its existing Label and cn.
function FieldGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex w-full flex-col gap-6", className)}
      {...props}
    />
  );
}

function Field({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="field"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  );
}

function FieldSet({ className, ...props }: ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex min-w-0 flex-col gap-5", className)}
      {...props}
    />
  );
}

function FieldLegend({ className, ...props }: ComponentProps<"legend">) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("mb-5 text-base font-medium", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn("text-sm font-medium leading-snug", className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldError({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      role="alert"
      data-slot="field-error"
      className={cn("text-xs leading-relaxed text-destructive", className)}
      {...props}
    />
  );
}

export { Field, FieldGroup, FieldSet, FieldLegend, FieldLabel, FieldDescription, FieldError };
