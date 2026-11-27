// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UserRequests from "../UserRequests";

const mocks = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("../../../api/api", () => ({ api: mocks }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) => select({ auth: { user: { id: "u1" } } }),
}));
vi.mock("../EditRequest", () => ({
  default: ({
    requestId,
    onSave,
    onCancel,
  }: {
    requestId: string;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <p>Editing {requestId}</p>
      <button onClick={onSave}>Save request</button>
      <button onClick={onCancel}>Cancel edit</button>
    </div>
  ),
}));
const request = {
  _id: "r1",
  bloodGroup: "O+",
  urgency: "high",
  message: "Synthetic request",
  status: "pending",
  address: { state: "Test State", district: "Test District", city: "Test City" },
  contactDetails: { email: "request@example.test", phone: "0000000000" },
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.get.mockResolvedValue({
    status: 200,
    data: {
      data: {
        bloodRequests: [
          request,
          {
            ...request,
            _id: "r2",
            urgency: "low",
            status: "completed",
            message: "Completed request",
          },
        ],
      },
    },
  });
});
afterEach(() => vi.restoreAllMocks());
const mount = async () => {
  render(
    <MemoryRouter>
      <UserRequests />
    </MemoryRouter>,
  );
  await screen.findByText("Synthetic request");
};
const menu = async () => {
  await userEvent.click(screen.getAllByRole("button", { name: "" })[0]!);
};

describe("user blood requests", () => {
  it("loads the user's requests and marks only the selected request completed", async () => {
    mocks.patch.mockResolvedValue({ status: 200 });
    await mount();
    expect(mocks.get).toHaveBeenCalledWith("/blood-requests/user/u1&page=1");
    await userEvent.click(screen.getByRole("button", { name: "Mark as completed" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Mark as completed" })).not.toBeInTheDocument(),
    );
    expect(mocks.patch).toHaveBeenCalledWith("/blood-requests/status/r1", { status: "completed" });
    expect(screen.getByText("Completed request")).toBeInTheDocument();
  });
  it.each(["error", "unexpected"])(
    "preserves pending status when completion returns %s",
    async (result) => {
      if (result === "error") mocks.patch.mockRejectedValue(new Error("Offline"));
      else mocks.patch.mockResolvedValue({ status: 204 });
      await mount();
      await userEvent.click(screen.getByRole("button", { name: "Mark as completed" }));
      if (result === "error")
        expect(await screen.findByRole("alert")).toHaveTextContent(
          "Failed to mark request as completed: Offline",
        );
      expect(screen.getByRole("button", { name: "Mark as completed" })).toBeInTheDocument();
    },
  );
  it.each([200, 204, "error"])("handles deletion result %s", async (result) => {
    if (result === "error") mocks.delete.mockRejectedValue(new Error("Offline"));
    else mocks.delete.mockResolvedValue({ status: result });
    await mount();
    await menu();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.keyboard("{Escape}");
    expect(mocks.delete).toHaveBeenCalledWith("/blood-requests/delete/r1");
    if (result === 200)
      await waitFor(() => expect(screen.queryByText("Synthetic request")).not.toBeInTheDocument());
    else if (result === "error")
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Failed to delete request: Offline",
      );
    else expect(screen.getByText("Synthetic request")).toBeInTheDocument();
  });
  it.each(["save", "cancel", "close"])(
    "opens the correct request editor and handles %s",
    async (action) => {
      vi.spyOn(console, "log").mockImplementation(() => {});
      await mount();
      await menu();
      await userEvent.click(screen.getByRole("button", { name: "Edit" }));
      expect(await screen.findByText("Editing r1")).toBeInTheDocument();
      await userEvent.click(
        screen.getByRole("button", {
          name: action === "save" ? "Save request" : action === "cancel" ? "Cancel edit" : "Close",
        }),
      );
      await waitFor(() => expect(screen.queryByText("Editing r1")).not.toBeInTheDocument());
      expect(mocks.get).toHaveBeenCalledTimes(action === "save" ? 2 : 1);
    },
  );
  it.each(["empty", "unexpected", "error"])("handles an %s fetch response", async (result) => {
    if (result === "error") mocks.get.mockRejectedValue(new Error("Offline"));
    else
      mocks.get.mockResolvedValue({
        status: result === "empty" ? 200 : 204,
        data: { data: { bloodRequests: [] } },
      });
    render(
      <MemoryRouter>
        <UserRequests />
      </MemoryRouter>,
    );
    expect(await screen.findByText("No blood donation requests found.")).toBeInTheDocument();
    if (result === "error") expect(screen.getByRole("alert")).toHaveTextContent("Offline");
  });
  it("shows a spinner while loading", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    expect(
      render(
        <MemoryRouter>
          <UserRequests />
        </MemoryRouter>,
      ).container.querySelector(".animate-spin"),
    ).toBeInTheDocument();
  });
});
