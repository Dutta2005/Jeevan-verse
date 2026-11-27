// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NotificationPage from "../NotificationPage";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  dispatch: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock("../../../api/api", () => ({
  api: { get: mocks.get, patch: mocks.patch, delete: mocks.delete },
}));
vi.mock("react-redux", () => ({ useDispatch: () => mocks.dispatch }));
vi.mock("react-router", () => ({ useNavigate: () => mocks.navigate }));
const notification = {
  _id: "n1",
  userId: "u1",
  type: "blood_request",
  message: "Synthetic notification",
  redirectUrl: "/bloodbridge/request-1",
  isRead: false,
  createdAt: "2026-01-01T00:00:00Z",
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.get.mockResolvedValue({ status: 200, data: { data: [notification] } });
  mocks.patch.mockResolvedValue({ status: 200 });
  mocks.delete.mockResolvedValue({ status: 200 });
});
afterEach(() => vi.restoreAllMocks());
const mount = async () => {
  render(<NotificationPage />);
  await screen.findByText(notification.message);
};

describe("notification center", () => {
  it("clears the unread badge, updates the cutoff, and loads notifications", async () => {
    await mount();
    expect(mocks.get).toHaveBeenCalledWith("/notifications/");
    expect(mocks.dispatch.mock.calls.map(([action]) => action.type)).toEqual([
      "notification/updateLastCheckedAt",
      "notification/clearNotifications",
    ]);
    expect(screen.getByText("1 total, 1 unread")).toBeInTheDocument();
  });
  it("shows loading placeholders", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    expect(render(<NotificationPage />).container.querySelectorAll(".animate-pulse")).toHaveLength(
      3,
    );
  });
  it.each([200, 204])("handles empty or unexpected responses: %i", async (status) => {
    mocks.get.mockResolvedValue({ status, data: { data: [] } });
    render(<NotificationPage />);
    expect(await screen.findByText("No notifications yet")).toBeInTheDocument();
  });
  it("ends loading after a fetch failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.get.mockRejectedValue(new Error("Offline"));
    render(<NotificationPage />);
    expect(await screen.findByText("No notifications yet")).toBeInTheDocument();
  });
  it.each([false, true])(
    "navigates after clicking a notification (already read: %s)",
    async (isRead) => {
      mocks.get.mockResolvedValue({
        status: 200,
        data: {
          data: [
            {
              ...notification,
              isRead,
              type: "general",
              redirectUrl: isRead ? "discussions" : "/discussions",
              createdAt: undefined,
            },
          ],
        },
      });
      await mount();
      fireEvent.click(screen.getByText(notification.message));
      await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/discussions"));
      expect(mocks.patch).toHaveBeenCalledTimes(isRead ? 0 : 1);
    },
  );
  it("navigates even when marking one notification read fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.patch.mockRejectedValue(new Error("Offline"));
    await mount();
    fireEvent.click(screen.getByText(notification.message));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith(notification.redirectUrl));
  });
  it("marks all notifications read and reloads the list", async () => {
    await mount();
    mocks.get.mockResolvedValue({
      status: 200,
      data: { data: [{ ...notification, isRead: true }] },
    });
    await userEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    await screen.findByText("1 total, 0 unread");
    expect(mocks.patch).toHaveBeenCalledWith("/notifications/mark-all-read");
    expect(mocks.get).toHaveBeenCalledTimes(2);
  });
  it.each(["error", "unexpected"])("preserves unread state after mark-all %s", async (result) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (result === "error") mocks.patch.mockRejectedValue(new Error("Offline"));
    else mocks.patch.mockResolvedValue({ status: 204 });
    await mount();
    await userEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(screen.getByText("1 total, 1 unread")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledTimes(1);
  });
  it.each([200, 204, "error"])(
    "handles individual deletion result %s without navigating",
    async (result) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      if (result === "error") mocks.delete.mockRejectedValue(new Error("Offline"));
      else mocks.delete.mockResolvedValue({ status: result });
      await mount();
      await userEvent.click(screen.getByRole("button", { name: "" }));
      expect(mocks.delete).toHaveBeenCalledWith("/notifications/delete/n1");
      if (result === 200)
        expect(await screen.findByText("No notifications yet")).toBeInTheDocument();
      else expect(screen.getByText(notification.message)).toBeInTheDocument();
      expect(mocks.navigate).not.toHaveBeenCalled();
    },
  );
  it.each([200, 204, "error"])(
    "requires confirmation to clear all and handles result %s",
    async (result) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      if (result === "error") mocks.delete.mockRejectedValue(new Error("Offline"));
      else mocks.delete.mockResolvedValue({ status: result });
      await mount();
      await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
      expect(mocks.delete).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole("button", { name: "Continue" }));
      expect(mocks.delete).toHaveBeenCalledWith("/notifications/delete-all");
      if (result === 200)
        expect(await screen.findByText("No notifications yet")).toBeInTheDocument();
      else expect(screen.getByText(notification.message)).toBeInTheDocument();
    },
  );
});
