// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { persistStore } from "redux-persist";

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe("persisted account migration", () => {
  it.each([false, true])("rehydrates safely (legacy inbox: %s)", async (legacy) => {
    if (legacy) {
      localStorage.setItem(
        "persist:root",
        JSON.stringify({
          auth: JSON.stringify({
            user: { id: "owner", name: "Synthetic", bloodGroup: "O+" },
            organization: null,
            role: "user",
            isAuthenticated: true,
          }),
          notification: JSON.stringify({
            owner: "previous",
            notifications: [{ _id: "private-old-item" }],
          }),
          _persist: JSON.stringify({ version: 1, rehydrated: true }),
        }),
      );
    }
    const { store } = await import("../store");
    const persistor = persistStore(store);
    await vi.waitFor(() => expect(persistor.getState().bootstrapped).toBe(true));
    expect(store.getState().notification.notifications).toEqual([]);
    expect(store.getState().notification.owner).toBeNull();
    expect(store.getState().auth.user?.id).toBe(legacy ? "owner" : undefined);
    await persistor.flush();
    expect(JSON.parse(localStorage.getItem("persist:root")!)).not.toHaveProperty("notification");
    persistor.pause();
  });
});
