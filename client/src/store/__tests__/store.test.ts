import { describe, expect, it } from "vitest";
import { store } from "../store";
import { login, logout } from "../authSlice";
import { selectNotificationInbox, setNotificationOwner } from "../notificationSlice";

describe("configured Redux store", () => {
  it("hides inbox data as soon as the signed-in account changes", () => {
    store.dispatch(login({ _id: "user-1", name: "Asha", info: { bloodGroup: "O+" } }));
    store.dispatch(setNotificationOwner("user-1"));
    expect(selectNotificationInbox(store.getState()).owner).toBe("user-1");

    store.dispatch(logout());
    expect(selectNotificationInbox(store.getState()).owner).toBeNull();
  });
});
