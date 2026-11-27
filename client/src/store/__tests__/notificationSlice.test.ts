import { describe, expect, it } from "vitest";
import notificationReducer, {
  addNotification,
  addNotifications,
  clearNotifications,
  updateLastCheckedAt,
} from "../notificationSlice";

const makeNotification = (id: string) => ({
  _id: id,
  type: "comment",
  message: `New comment ${id}`,
  redirectUrl: `/discussions/${id}`,
  data: {},
  createdAt: "2026-11-26T00:00:00.000Z",
  isRead: false,
});

describe("notification state", () => {
  it("adds a notification once", () => {
    const notification = makeNotification("n1");
    const once = notificationReducer(undefined, addNotification(notification));
    const twice = notificationReducer(
      once,
      addNotification({ ...notification, message: "Duplicate event" }),
    );

    expect(twice.notifications).toEqual([notification]);
  });

  it("adds only notifications not already in the list", () => {
    const existing = makeNotification("n1");
    const initial = notificationReducer(undefined, addNotification(existing));
    const result = notificationReducer(
      initial,
      addNotifications([existing, makeNotification("n2")]),
    );

    expect(result.notifications.map(({ _id }) => _id)).toEqual(["n2", "n1"]);
  });

  it("clears the list without resetting the last-checked timestamp", () => {
    const withNotification = notificationReducer(
      undefined,
      addNotification(makeNotification("n1")),
    );
    const checked = notificationReducer(withNotification, updateLastCheckedAt());
    const cleared = notificationReducer(checked, clearNotifications());

    expect(cleared.notifications).toEqual([]);
    expect(cleared.lastCheckedAt).toBe(checked.lastCheckedAt);
  });

  it("records the last-checked time as a valid ISO timestamp", () => {
    const result = notificationReducer(undefined, updateLastCheckedAt());

    expect(result.lastCheckedAt).not.toBeNull();
    expect(Date.parse(result.lastCheckedAt ?? "")).not.toBeNaN();
  });
});
