// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useChatController } from "../useChatController";
import { useUmeed } from "../umeed-context";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock("@/api/api", () => ({ api }));
beforeEach(() => vi.resetAllMocks());

describe("chat controller request boundaries", () => {
  it("ignores conversation actions until session loading completes", async () => {
    let finish!: (value: unknown) => void;
    api.get.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { result } = renderHook(() => useChatController());
    await act(async () => {
      await result.current.loadSession("s1");
      await result.current.createSession();
      await result.current.deleteSession("s1");
      await result.current.sendMessage();
    });
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.post).not.toHaveBeenCalled();
    expect(api.delete).not.toHaveBeenCalled();
    await act(async () => finish({ data: { data: [] } }));
    await act(async () => {
      await result.current.sendMessage();
    });
    expect(api.post).not.toHaveBeenCalled();
  });
  it("reports an incomplete new-session response and preserves the draft", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    api.post.mockResolvedValue({ data: { data: null } });
    const { result } = renderHook(() => useChatController());
    await waitFor(() => expect(result.current.sessionsLoading).toBe(false));
    act(() => result.current.setMessageInput("My first question"));
    await act(async () => {
      await result.current.sendMessage();
    });
    expect(result.current.error).toBe("A new chat could not be created. Please try again.");
    expect(result.current.messageInput).toBe("My first question");
  });
  it.each(["resolve", "reject"])(
    "ignores a session request that settles after unmount (%s)",
    async (outcome) => {
      let finish!: (value: unknown) => void;
      let fail!: (reason: unknown) => void;
      api.get.mockReturnValue(
        new Promise((resolve, reject) => {
          finish = resolve;
          fail = reject;
        }),
      );
      const view = renderHook(() => useChatController());
      view.unmount();
      await act(async () => {
        if (outcome === "resolve") finish({ data: { data: [] } });
        else fail(new Error("Offline"));
      });
      expect(api.post).not.toHaveBeenCalled();
    },
  );
  it("explains when a chat consumer has no workspace", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useUmeed())).toThrow(
      "Umeed must be rendered inside its workspace",
    );
    error.mockRestore();
  });
});
