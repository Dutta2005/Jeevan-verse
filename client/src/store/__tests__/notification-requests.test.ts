import { beforeEach, describe, expect, it, vi } from "vitest";
import { login, logout } from "../authSlice";
import { changeNotifications, loadNotifications, setNotificationOwner } from "../notificationSlice";
import { store } from "../store";

const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("@/api/api", () => ({ api }));
const makeStore = () => {
  store.dispatch(logout());
  store.dispatch(setNotificationOwner(null));
  return store;
};
beforeEach(() => vi.resetAllMocks());

describe("notification request boundaries", () => {
  it("rejects malformed inbox responses with a retryable error state", async () => {
    api.get.mockResolvedValue({ data: { data: null } });
    const store = makeStore();
    store.dispatch(setNotificationOwner("owner"));
    await store.dispatch(loadNotifications("owner"));
    expect(store.getState().notification.status).toBe("error");
    expect(store.getState().notification.notifications).toEqual([]);
    api.get.mockResolvedValue({ data: { data: [] } });
    await store.dispatch(loadNotifications("owner"));
    expect(store.getState().notification.status).toBe("ready");
  });

  it("does not mutate notifications without a matching signed-in owner", async () => {
    const store = makeStore();
    await store.dispatch(changeNotifications({ kind: "readAll" }));
    store.dispatch(setNotificationOwner("previous"));
    store.dispatch(login({ _id: "current", name: "Synthetic", info: { bloodGroup: "O+" } }));
    await store.dispatch(changeNotifications({ kind: "deleteAll" }));
    expect(api.patch).not.toHaveBeenCalled();
    expect(api.delete).not.toHaveBeenCalled();
  });

  it("does not report an old account's failed mutation after logout", async () => {
    let rejectRequest!: (error: Error) => void;
    api.patch.mockReturnValue(
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
    );
    const store = makeStore();
    store.dispatch(login({ _id: "owner", name: "Synthetic", info: { bloodGroup: "O+" } }));
    store.dispatch(setNotificationOwner("owner"));
    const request = store.dispatch(changeNotifications({ kind: "readAll" }));
    store.dispatch(logout());
    rejectRequest(new Error("Offline"));
    await request;
    expect(store.getState().notification.actionError).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });
});
