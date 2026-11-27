// @vitest-environment jsdom
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Notifications from "@/components/navbar/Notifications";
import authReducer, { login } from "@/store/authSlice";
import notificationReducer, {
  loadNotifications,
  setNotificationOwner,
} from "@/store/notificationSlice";
import NotificationPage from "../NotificationPage";

const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("@/api/api", () => ({ api }));

const notification = {
  _id: "n1",
  type: "blood_request",
  message: "Synthetic request",
  redirectUrl: "/bloodbridge/request/r1",
  isRead: false,
  createdAt: "2026-01-01T00:00:00Z",
};

const read = {
  ...notification,
  _id: "n2",
  type: "comment",
  message: "Synthetic comment",
  isRead: true,
  createdAt: undefined,
};

const results = (...items: (typeof notification | typeof read)[]) => ({ data: { data: items } });

function mount(path = "/notifications") {
  const store = configureStore({
    reducer: { auth: authReducer, notification: notificationReducer },
  });
  store.dispatch(login({ _id: "user-1", name: "Asha", info: { bloodGroup: "O+" } }));
  store.dispatch(setNotificationOwner("user-1"));
  void store.dispatch(loadNotifications("user-1"));

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Notifications />
        <Routes>
          <Route path="/" element={<p>Home</p>} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path={notification.redirectUrl} element={<p>Blood request details</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return userEvent.setup();
}

beforeEach(() => {
  vi.resetAllMocks();
  api.get.mockResolvedValue(results(notification, read));
  api.patch.mockResolvedValue({});
  api.delete.mockResolvedValue({});
});

describe("notification center", () => {
  it("keeps the unread badge when opening the inbox and filters read items out", async () => {
    const user = mount("/");
    const bell = await screen.findByRole("button", { name: "Notifications (1 unread)" });
    await user.click(bell);
    await user.click(screen.getByRole("menuitem", { name: "View all notifications" }));
    expect(screen.getByRole("button", { name: "Notifications (1 unread)" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Synthetic comment/ })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Unread" }));
    expect(screen.queryByRole("link", { name: /Synthetic comment/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Synthetic request/ })).toHaveAttribute(
      "href",
      notification.redirectUrl,
    );
  });

  it("marks an item read and updates the bell when opened from the page", async () => {
    const user = mount();
    const link = await screen.findByRole("link", { name: /Synthetic request/ });
    api.get.mockResolvedValue(results({ ...notification, isRead: true }, read));
    link.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Blood request details")).toBeInTheDocument();
    expect(api.patch).toHaveBeenCalledWith("/notifications/mark-read/n1", undefined, {
      headers: { "X-Notification-Account": "user-1" },
    });
    expect(await screen.findByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });

  it("uses one count after marking all as read", async () => {
    const user = mount();
    const action = await screen.findByRole("button", { name: "Mark all as read" });
    api.get.mockResolvedValue(results({ ...notification, isRead: true }, read));
    await user.click(action);
    expect(api.patch).toHaveBeenCalledWith("/notifications/mark-all-read", undefined, {
      headers: { "X-Notification-Account": "user-1" },
    });
    expect(await screen.findByRole("button", { name: "Notifications" })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Unread" }));
    expect(screen.getByText("No unread notifications")).toBeInTheDocument();
  });

  it("confirms before clearing history", async () => {
    const user = mount();
    await user.click(await screen.findByRole("button", { name: "Clear all" }));
    expect(api.delete).not.toHaveBeenCalled();
    api.get.mockResolvedValue(results());
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Clear all" }),
    );
    expect(api.delete).toHaveBeenCalledWith("/notifications/delete-all", {
      headers: { "X-Notification-Account": "user-1" },
    });
    expect(await screen.findByText("No notifications yet")).toBeInTheDocument();
  });

  it("shows an action error while preserving an item if deletion fails", async () => {
    const user = mount();
    api.delete.mockRejectedValue(new Error("Offline"));
    await user.click(
      await screen.findByRole("button", { name: "Delete notification: Synthetic request" }),
    );
    expect(api.delete).toHaveBeenCalledWith("/notifications/delete/n1", {
      headers: { "X-Notification-Account": "user-1" },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not delete this notification.",
    );
    expect(screen.getByRole("link", { name: /Synthetic request/ })).toBeInTheDocument();
  });

  it("keeps a confirmed deletion synchronized when reloading fails", async () => {
    const user = mount();
    const remove = await screen.findByRole("button", {
      name: "Delete notification: Synthetic request",
    });
    api.get.mockRejectedValueOnce(new Error("Offline"));
    await user.click(remove);
    expect(await screen.findByText("Could not load notifications.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Synthetic request/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });

  it("refreshes and groups incoming items by local calendar date while live updates are unavailable", async () => {
    const user = mount();
    const refresh = await screen.findByRole("button", { name: "Refresh" });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    api.get.mockResolvedValue(
      results(
        { ...notification, createdAt: new Date().toISOString() },
        { ...read, createdAt: yesterday.toISOString() },
      ),
    );
    await user.click(refresh);
    expect(await screen.findByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Yesterday" })).toBeInTheDocument();
  });

  it("shows loading and recovers from a history fetch failure", async () => {
    api.get.mockRejectedValueOnce(new Error("Offline"));
    const user = mount();
    expect(screen.getByLabelText("Loading notifications")).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Synthetic request")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });
});
