// @vitest-environment jsdom
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authReducer, { login } from "@/store/authSlice";
import notificationReducer, {
  loadNotifications,
  setNotificationOwner,
  setNotificationsLive,
} from "@/store/notificationSlice";
import Notifications from "../Notifications";

const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock("@/api/api", () => ({ api }));
const records = Array.from({ length: 6 }, (_, index) => ({
  _id: `n${index}`,
  type: index ? "comment" : "blood_request",
  message: `Activity ${index + 1}`,
  redirectUrl: index ? "/discussions" : "/bloodbridge/request/r1",
  isRead: index === 0,
}));

function mount() {
  const store = configureStore({
    reducer: { auth: authReducer, notification: notificationReducer },
  });
  store.dispatch(login({ _id: "user-1", info: { bloodGroup: "O+" } }));
  store.dispatch(setNotificationOwner("user-1"));
  store.dispatch(setNotificationsLive(true));
  void store.dispatch(loadNotifications("user-1"));
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Notifications />
        <Routes>
          <Route path="/" element={null} />
          <Route path="/discussions" element={<p>Discussion destination</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return userEvent.setup();
}

beforeEach(() => {
  vi.resetAllMocks();
  api.get.mockResolvedValue({ data: { data: records } });
  api.patch.mockResolvedValue({});
});

describe("notification preview", () => {
  it("shows five newest notifications and counts unread items across the whole inbox", async () => {
    const user = mount();
    const bell = await screen.findByRole("button", { name: "Notifications (5 unread)" });
    bell.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menuitem", { name: /Activity 1/ })).toHaveAttribute(
      "href",
      "/bloodbridge/request/r1",
    );
    expect(screen.getByRole("menuitem", { name: /Activity 5/ })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Activity 6/ })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "View all notifications" })).toHaveAttribute(
      "href",
      "/notifications",
    );
    expect(screen.queryByText(/Live updates unavailable/)).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(bell).toHaveFocus();
  });

  it("opens an unread row from the keyboard and marks it read", async () => {
    const user = mount();
    const bell = await screen.findByRole("button", { name: "Notifications (5 unread)" });
    bell.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(await screen.findByText("Discussion destination")).toBeInTheDocument();
    expect(api.patch).toHaveBeenCalledWith("/notifications/mark-read/n1", undefined, {
      headers: { "X-Notification-Account": "user-1" },
    });
  });

  it("offers a retry for unavailable history", async () => {
    api.get.mockRejectedValueOnce(new Error("Offline"));
    const user = mount();
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load notifications.");
    await user.click(screen.getByRole("menuitem", { name: "Try again" }));
    expect(await screen.findByRole("menuitem", { name: /Activity 1/ })).toBeInTheDocument();
  });
});
