export function authFieldProps(id: string, error?: string, description?: string) {
  return {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby":
      [error && `${id}-error`, description && `${id}-description`].filter(Boolean).join(" ") ||
      undefined,
  };
}
