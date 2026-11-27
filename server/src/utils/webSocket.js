import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { verifyJWT } from "../middlewares/auth.middleware.js";

let io;

export const initializeWebSocket = (server) => {
    if (io) return io;

    io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "https://jeevan-verse.vercel.app"],
            credentials: true,
            methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        },
        path: "/socket.io/",
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ["websocket", "polling"],
    });

    const parseCookies = cookieParser();
    io.use((socket, next) => {
        const req = socket.request;
        const res = req.res;
        parseCookies(req, res, () => {
            verifyJWT(req, res, (error) => {
                if (error || socket.handshake.auth.userId !== req.user._id.toString()) {
                    return next(new Error("Unauthorized"));
                }
                next();
            });
        });
    });

    io.on("connection", async (socket) => {
        await socket.join(socket.request.user._id.toString());
        socket.emit("roomJoined", { success: true });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("WebSocket server is not initialized!");
    return io;
};
