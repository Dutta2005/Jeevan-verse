export function notificationPath(destination: string) {
  const path = `/${destination.replace(/^\/+/, "")}`;
  return /^\/[\w-]/.test(path) && !path.includes("\\") ? path : "/notifications";
}
