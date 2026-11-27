import { describe, expect, it, vi } from "vitest";
import { initializeSocket } from "../socket";

const io = vi.hoisted(() => vi.fn());
vi.mock("socket.io-client", () => ({ io }));

describe("notification socket", () => {
  it("opens a dedicated cookie-authenticated connection after handlers are attached", () => {
    initializeSocket("account-one");
    initializeSocket("account-two");

    expect(io).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({
        withCredentials: true,
        autoConnect: false,
        forceNew: true,
        auth: { userId: "account-one" },
      }),
    );
    expect(io).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({ auth: { userId: "account-two" } }),
    );
  });
});
