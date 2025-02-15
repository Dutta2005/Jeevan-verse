import { io, Socket } from "socket.io-client";
import { store } from "../store/store"; // Import your Redux store
import { addNotification } from "../store/notificationSlice";
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
let socket: Socket | null = null;

let isHandlingBloodRequest = false;
let bloodRequestTimeout: NodeJS.Timeout | null = null;

export const initializeSocket = (userId: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { userId },
      path: '/socket.io/',
    });

    socket.on("connect", () => {
      socket?.emit("joinRoom", userId);
    });

    // Debounced blood request handler
    socket.on("bloodRequest", (notification) => {
      if (isHandlingBloodRequest) {
        return;
      }

      isHandlingBloodRequest = true;

      if (bloodRequestTimeout) {
        clearTimeout(bloodRequestTimeout);
      }

      bloodRequestTimeout = setTimeout(() => {
        store.dispatch(
          addNotification({
            ...notification,
            timestamp: Date.now(),
          })
        );
        isHandlingBloodRequest = false;
        bloodRequestTimeout = null;
      }, 100); // Small delay to prevent duplicate events
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      if (socket?.io?.opts?.transports?.includes('websocket' as any)) {
        socket.io.opts.transports = ['polling' as any];
      }
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        socket?.connect();
      }
    });
  } else if (!socket.connected) {
    socket.connect();
  }

  return socket;
};