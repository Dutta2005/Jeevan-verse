import { describe, expect, it } from "vitest";
import { store } from "../store";
import { login, logout } from "../authSlice";
import { addNotification } from "../notificationSlice";

describe("configured Redux store", () => {
  it("connects auth and notification reducers through the persisted store", () => {
    store.dispatch(
      login({ _id: "user-1", name: "Asha", info: { bloodGroup: "O+" } }),
    );
    store.dispatch(
      addNotification({
        _id: "notification-1",
        type: "comment",
        message: "New comment",
        redirectUrl: "/discussions/post-1",
        data: {},
        createdAt: "2026-11-26T00:00:00.000Z",
        isRead: false,
      }),
    );

    const state = store.getState();
    expect(state.auth.user?.id).toBe("user-1");
    expect(state.notification.notifications).toHaveLength(1);

    store.dispatch(logout());
  });
});
