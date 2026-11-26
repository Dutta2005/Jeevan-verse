import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
