import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ io: vi.fn(), dispatch: vi.fn() }));
vi.mock("socket.io-client", () => ({ io: mocks.io, WebSocket: "websocket", XHR: "polling" }));
vi.mock("../../store/store", () => ({ store: { dispatch: mocks.dispatch } }));

async function setup(connected = true) {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const socket = {
    connected,
    on: vi.fn((event, handler) => handlers.set(event, handler)),
    emit: vi.fn(),
    connect: vi.fn(),
    io: { opts: { transports: ["websocket", "polling"] } },
  };
  mocks.io.mockReturnValue(socket);
  const { initializeSocket } = await import("../socket");
  return {
    initializeSocket,
    socket,
    emit: (event: string, ...args: unknown[]) => handlers.get(event)?.(...args),
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("socket lifecycle", () => {
  it("joins the user's room on every connection and reuses the connected socket", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.test");
    const { initializeSocket, socket, emit } = await setup();
    expect(initializeSocket("user-1")).toBe(socket);
    expect(mocks.io).toHaveBeenCalledWith(
      "https://api.example.test",
      expect.objectContaining({ auth: { userId: "user-1" }, withCredentials: true }),
    );
    emit("connect");
    expect(socket.emit).toHaveBeenCalledWith("joinRoom", "user-1");
    initializeSocket("user-1");
    expect(mocks.io).toHaveBeenCalledTimes(1);
    expect(socket.connect).not.toHaveBeenCalled();
    socket.connected = false;
    initializeSocket("user-1");
    expect(socket.connect).toHaveBeenCalledTimes(1);
  });

  it("uses the local fallback and suppresses duplicate blood request events during the debounce window", async () => {
    vi.stubEnv("VITE_API_URL", "");
    const { initializeSocket, emit } = await setup();
    initializeSocket("user-1");
    expect(mocks.io).toHaveBeenCalledWith("http://localhost:8000", expect.any(Object));
    const notification = { _id: "request-1", message: "Synthetic notification" };
    emit("bloodRequest", notification);
    emit("bloodRequest", notification);
    expect(mocks.dispatch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(mocks.dispatch).toHaveBeenCalledTimes(1);
    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { ...notification, timestamp: Date.now() } }),
    );
    emit("bloodRequest", { ...notification, _id: "request-2" });
    vi.advanceTimersByTime(100);
    expect(mocks.dispatch).toHaveBeenCalledTimes(2);
  });

  it("falls back to polling after transport errors and reconnects only after a server disconnect", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { initializeSocket, socket, emit } = await setup();
    initializeSocket("user-1");
    emit("connect_error", new Error("Connection failed"));
    expect(error).toHaveBeenCalled();
    expect(socket.io.opts.transports).toEqual(["polling"]);
    emit("connect_error", new Error("Polling failed"));
    expect(socket.io.opts.transports).toEqual(["polling"]);
    emit("disconnect", "transport close");
    expect(socket.connect).not.toHaveBeenCalled();
    emit("disconnect", "io server disconnect");
    expect(socket.connect).toHaveBeenCalledTimes(1);
  });
});
