
import { Server } from "socket.io";

let io;

export const initializeWebSocket = (server) => {
    if (io) {
        console.log('WebSocket server already initialized');
        return io;
    }

    console.log('Starting WebSocket server initialization...');
    
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "https://jeevan-verse.vercel.app"],
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        },
        path: "/socket.io/",
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling']
    });

    // Log when the server is ready
    io.engine.on("connection_error", (err) => {
        console.log("Connection error:", err);
    });

    io.engine.on("initial_headers", () => {
        console.log("WebSocket server initialized and ready for connections");
    });

    io.on("connection", (socket) => {
        console.log(`New socket connection - ID: ${socket.id}`);
        console.log('Client handshake:', socket.handshake.query);
        
        // Log current number of connections
        const connectedSockets = io.sockets.sockets.size;
        console.log(`Total connected clients: ${connectedSockets}`);

        socket.on("joinRoom", (room) => {
            try {
                console.log(`Join room request - Socket: ${socket.id}, Room: ${room}`);
                socket.join(room);
                
                // Verify room joining
                const socketRooms = Array.from(socket.rooms);
                console.log(`Socket ${socket.id} is now in rooms:`, socketRooms);
                
                // Send confirmation back to client
                socket.emit("roomJoined", { 
                    success: true, 
                    room,
                    socketId: socket.id 
                });
            } catch (error) {
                console.error(`Error joining room: ${error.message}`);
                socket.emit("roomJoined", { 
                    success: false, 
                    error: error.message 
                });
            }
        });

        socket.on("sendNotification", (data) => {
            try {
                console.log(`Notification request from ${socket.id}:`, data);
                const { room, notification } = data;
                io.to(room).emit("receiveNotification", notification);
                console.log(`Notification sent to room ${room}`);
            } catch (error) {
                console.error(`Error sending notification: ${error.message}`);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`Socket ${socket.id} disconnected. Reason: ${reason}`);
            
        });

        socket.on("error", (error) => {
            console.error(`Socket ${socket.id} error:`, error);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("WebSocket server is not initialized!");
    }
    return io;
};