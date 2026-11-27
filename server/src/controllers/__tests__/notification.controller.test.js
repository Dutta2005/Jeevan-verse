import { describe, expect, it, vi } from "vitest";
import {
  getAllNotifications,
  getNotificationsAfterTime,
  markAllNotificationsAsRead,
  deleteAllNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../notification.controller.js";
import { Notification } from "../../models/notification.model.js";

function invoke(handler, query = {}) {
  return new Promise((resolve, reject) => {
    handler(
      {
        user: { _id: "self" },
        query: { userId: "other", ...query },
        body: { userId: "other" },
        params: { notificationId: "507f1f77bcf86cd799439011" },
      },
      {
        status: (statusCode) => ({
          json: (body) => resolve({ statusCode, body }),
        }),
      },
      reject
    );
  });
}

describe("account-scoped notifications", () => {
  it("limits individual read updates to the owner", async () => {
    const update = vi.spyOn(Notification, "findOneAndUpdate").mockResolvedValue(null);
    vi.spyOn(Notification, "findById").mockResolvedValue(null);
    expect(await invoke(markNotificationAsRead)).toMatchObject({ statusCode: 404 });
    expect(update).toHaveBeenCalledWith(
      { _id: "507f1f77bcf86cd799439011", userId: "self" },
      { $set: { isRead: true } },
      { new: true },
    );
  });

  it("limits individual deletions to the owner", async () => {
    const remove = vi.spyOn(Notification, "findOneAndDelete").mockResolvedValue(null);
    vi.spyOn(Notification, "findByIdAndDelete").mockResolvedValue(null);
    expect(await invoke(deleteNotification)).toMatchObject({ statusCode: 404 });
    expect(remove).toHaveBeenCalledWith({
      _id: "507f1f77bcf86cd799439011",
      userId: "self",
    });
  });

  it("lists only the authenticated account's notifications, newest first", async () => {
    const records = [{ message: "Synthetic notification" }];
    const sort = vi.fn().mockResolvedValue(records);
    const find = vi.spyOn(Notification, "find").mockReturnValue({ sort });
    expect(await invoke(getAllNotifications)).toMatchObject({
      statusCode: 200,
      body: { data: records },
    });
    expect(find).toHaveBeenCalledWith({ userId: "self" });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("marks only the authenticated account's unread notifications", async () => {
    const update = vi
      .spyOn(Notification, "updateMany")
      .mockResolvedValue({ modifiedCount: 2 });
    expect(await invoke(markAllNotificationsAsRead)).toMatchObject({
      statusCode: 200,
      body: { data: { modifiedCount: 2 } },
    });
    expect(update).toHaveBeenCalledWith(
      { userId: "self", isRead: false },
      { $set: { isRead: true } }
    );
  });

  it("deletes only the authenticated account's notifications", async () => {
    const remove = vi
      .spyOn(Notification, "deleteMany")
      .mockResolvedValue({ deletedCount: 2 });
    expect(await invoke(deleteAllNotifications)).toMatchObject({
      statusCode: 200,
    });
    expect(remove).toHaveBeenCalledWith({ userId: "self" });
  });

  it("combines timestamp and account filters", async () => {
    const sort = vi.fn().mockResolvedValue([]);
    const find = vi.spyOn(Notification, "find").mockReturnValue({ sort });
    const time = "2026-01-01T00:00:00.000Z";
    expect(await invoke(getNotificationsAfterTime, { time })).toMatchObject({
      statusCode: 200,
      body: { data: [] },
    });
    expect(find).toHaveBeenCalledWith({
      userId: "self",
      createdAt: { $gt: new Date(time) },
    });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it.each([undefined, "invalid-date"])(
    "rejects invalid timestamps before querying",
    async (time) => {
      const find = vi.spyOn(Notification, "find");
      expect(await invoke(getNotificationsAfterTime, { time })).toMatchObject({
        body: { success: false },
      });
      expect(find).not.toHaveBeenCalled();
    }
  );

  it("returns a failed response when the list query fails", async () => {
    vi.spyOn(Notification, "find").mockReturnValue({
      sort: vi.fn().mockRejectedValue(new Error("Database unavailable")),
    });
    expect(await invoke(getAllNotifications)).toMatchObject({
      statusCode: 500,
      body: { success: false },
    });
  });
});
