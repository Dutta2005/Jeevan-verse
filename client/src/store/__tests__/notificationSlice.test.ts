import { describe, expect, it } from "vitest";
import notificationReducer, { loadNotifications, setNotificationOwner } from "../notificationSlice";

const notification = {
  _id: "n1",
  type: "comment",
  message: "Synthetic comment",
  redirectUrl: "/discussions/post-1",
  isRead: false,
};

describe("notification state", () => {
  it("drops the old list and pending results on account changes", () => {
    const account = notificationReducer(undefined, setNotificationOwner("first"));
    const pending = notificationReducer(account, loadNotifications.pending("one", "first"));
    const loaded = notificationReducer(
      pending,
      loadNotifications.fulfilled([notification], "one", "first"),
    );
    expect(loaded.notifications).toEqual([notification]);
    const switched = notificationReducer(loaded, setNotificationOwner("second"));
    expect(
      notificationReducer(switched, loadNotifications.fulfilled([notification], "one", "first"))
        .notifications,
    ).toEqual([]);
  });

  it("keeps the latest reload when responses finish out of order", () => {
    const account = notificationReducer(undefined, setNotificationOwner("first"));
    const pending = notificationReducer(account, loadNotifications.pending("one", "first"));
    const newer = notificationReducer(pending, loadNotifications.pending("two", "first"));
    const current = notificationReducer(newer, loadNotifications.fulfilled([], "two", "first"));
    expect(
      notificationReducer(current, loadNotifications.fulfilled([notification], "one", "first"))
        .notifications,
    ).toEqual([]);
  });
});
