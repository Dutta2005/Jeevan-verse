import { cva } from "class-variance-authority";

export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-muted/50 data-[state=open]:bg-muted/50",
);
