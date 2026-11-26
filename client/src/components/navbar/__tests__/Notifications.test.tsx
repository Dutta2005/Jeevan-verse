// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Notifications from "../Notifications";
import { addNotifications } from "../../../store/notificationSlice";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  dispatch: vi.fn(),
  notifications: [] as {
    _id?: string;
    type: string;
    message: string;
    redirectUrl: string;
    createdAt?: string;
  }[],
  lastCheckedAt: 1234,
}));
vi.mock("../../../api/api", () => ({ api: { get: mocks.get } }));
vi.mock("react-redux", () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      notification: { notifications: mocks.notifications, lastCheckedAt: mocks.lastCheckedAt },
    }),
}));
beforeEach(() => {
  vi.resetAllMocks();
  mocks.notifications = [];
  mocks.lastCheckedAt = 1234;
  mocks.get.mockResolvedValue({ data: { data: [] } });
});
afterEach(() => vi.restoreAllMocks());
const mount = () =>
  render(
    <MemoryRouter>
      <Notifications />
    </MemoryRouter>,
  );

describe("notification menu", () => {
  it("fetches notifications after the cutoff and shows an empty state", async () => {
    mount();
    await waitFor(() => expect(mocks.dispatch).toHaveBeenCalledWith(addNotifications([])));
    expect(mocks.get).toHaveBeenCalledWith("/notifications/after", { params: { time: 1234 } });
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("No new notifications")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all notifications" })).toHaveAttribute(
      "href",
      "/notifications",
    );
  });
  it("shows notification count, links and optional dates", async () => {
    mocks.notifications = [
      {
        _id: "n1",
        type: "blood_request",
        message: "Synthetic request",
        redirectUrl: "/bloodbridge/request/r1",
        createdAt: "2026-01-01T00:00:00Z",
      },
      { type: "general", message: "Synthetic update", redirectUrl: "/discussions" },
    ];
    mount();
    expect(screen.getByText("2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Synthetic request")).toBeInTheDocument();
    expect(screen.getByText("Synthetic update").closest("a")).toHaveAttribute(
      "href",
      "/discussions",
    );
  });
  it("does not dispatch when the response contains no data", async () => {
    mocks.get.mockResolvedValue({ data: {} });
    mount();
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("No new notifications")).toBeInTheDocument();
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });
  it("logs fetch failures without crashing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.get.mockRejectedValue(new Error("Offline"));
    mount();
    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });
});
