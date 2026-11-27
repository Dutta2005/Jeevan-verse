import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function initializeSocket(owner: string): Socket {
  return io(SOCKET_URL, {
    autoConnect: false,
    forceNew: true,
    auth: { userId: owner },
    withCredentials: true,
    reconnectionAttempts: 5,
    path: "/socket.io/",
  });
}
