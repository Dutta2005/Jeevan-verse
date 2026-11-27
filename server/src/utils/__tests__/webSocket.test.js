import { describe, expect, it, vi } from "vitest";
import { initializeWebSocket } from "../webSocket.js";

const server = vi.hoisted(() => ({ use: vi.fn(), on: vi.fn() }));
vi.mock("socket.io", () => ({ Server: class { constructor() { return server; } } }));
vi.mock("../../middlewares/auth.middleware.js", () => ({
    verifyJWT: (req, _res, next) => {
        if (!req.cookies.accessToken) return next(new Error("Missing session"));
        req.user = { _id: "account-one" };
        next();
    },
}));

describe("notification socket authentication", () => {
    initializeWebSocket({});
    const authorize = server.use.mock.calls[0][0];
    const connect = server.on.mock.calls.find(([event]) => event === "connection")[1];

    it("joins the account identified by the verified session", async () => {
        const socket = {
            request: { headers: { cookie: "accessToken=synthetic" } },
            handshake: { auth: { userId: "account-one" } },
            join: vi.fn(),
            emit: vi.fn(),
        };
        const next = vi.fn();
        authorize(socket, next);
        expect(next).toHaveBeenCalledWith();
        await connect(socket);
        expect(socket.join).toHaveBeenCalledWith("account-one");
        expect(socket.emit).toHaveBeenCalledWith("roomJoined", { success: true });
    });

    it.each([
        [{}, "account-one"],
        [{ cookie: "accessToken=synthetic" }, "other-account"],
    ])("rejects missing sessions and stale account assertions", (headers, userId) => {
        const next = vi.fn();
        authorize({ request: { headers }, handshake: { auth: { userId } } }, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Unauthorized" }));
    });
});
