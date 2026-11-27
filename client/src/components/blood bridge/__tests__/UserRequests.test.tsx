// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UserRequests from "../UserRequests";

const mocks = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
const account = vi.hoisted(() => ({ id: "u1" as string | undefined }));
vi.mock("../../../api/api", () => ({ api: mocks }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { user: { id: account.id } } }),
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
  account.id = "u1";
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
  await userEvent.click(screen.getAllByRole("button", { name: /Actions for/ })[0]!);
};

describe("user blood requests", () => {
  it("does not fetch a request list without an authenticated user", () => {
    account.id = undefined;
    render(
      <MemoryRouter>
        <UserRequests />
      </MemoryRouter>,
    );
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it.each(["resolve", "reject"])(
    "ignores late owned-request results after unmount (%s)",
    async (outcome) => {
      let finish!: (value: unknown) => void;
      let fail!: (reason: unknown) => void;
      mocks.get.mockReturnValue(
        new Promise((resolve, reject) => {
          finish = resolve;
          fail = reject;
        }),
      );
      const view = render(
        <MemoryRouter initialEntries={["/bloodbridge?page=invalid"]}>
          <UserRequests />
        </MemoryRouter>,
      );
      expect(mocks.get).toHaveBeenCalledWith("/blood-requests/user/u1?page=1");
      view.unmount();
      await act(async () => {
        if (outcome === "resolve") finish({ status: 200, data: { data: { bloodRequests: [] } } });
        else fail(new Error("Offline"));
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );
  it("paginates and returns to the previous page when deleting its final record", async () => {
    const page = (currentPage: number) => ({
      status: 200,
      data: {
        data: {
          bloodRequests: [request],
          currentPage,
          totalPages: 2,
          hasNext: currentPage === 1,
          hasPrev: currentPage === 2,
        },
      },
    });
    mocks.get.mockImplementation((url: string) => Promise.resolve(page(url.endsWith("2") ? 2 : 1)));
    mocks.delete.mockResolvedValue({ status: 200 });
    await mount();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Page 2 of 2");
    await menu();
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete request" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete request" }));
    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument();
  });
  it("retries load errors and cancels deletion without writing", async () => {
    mocks.get.mockRejectedValueOnce(new Error("Offline"));
    render(
      <MemoryRouter>
        <UserRequests />
      </MemoryRouter>,
    );
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByText("Synthetic request");
    await menu();
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete request" }));
    await userEvent.click(screen.getByRole("button", { name: "Keep request" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(mocks.delete).not.toHaveBeenCalled();
  });
  it("loads the user's requests and marks only the selected request completed", async () => {
    mocks.patch.mockResolvedValue({ status: 200 });
    await mount();
    expect(mocks.get).toHaveBeenCalledWith("/blood-requests/user/u1?page=1");
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
      if (result === "error") expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
      expect(screen.getByRole("button", { name: "Mark as completed" })).toBeInTheDocument();
    },
  );
  it.each([200, 204, "error"])("handles deletion result %s", async (result) => {
    if (result === "error") mocks.delete.mockRejectedValue(new Error("Offline"));
    else mocks.delete.mockResolvedValue({ status: result });
    await mount();
    await menu();
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete request" }));
    expect(mocks.delete).not.toHaveBeenCalled();
    if (result === 200)
      mocks.get.mockResolvedValue({ status: 200, data: { data: { bloodRequests: [] } } });
    await userEvent.click(screen.getByRole("button", { name: "Delete request" }));
    await userEvent.keyboard("{Escape}");
    expect(mocks.delete).toHaveBeenCalledWith("/blood-requests/delete/r1");
    if (result === 200)
      await waitFor(() => expect(screen.queryByText("Synthetic request")).not.toBeInTheDocument());
    else if (result === "error")
      expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
    else expect(screen.getByText("Synthetic request")).toBeInTheDocument();
  });
  it.each(["save", "cancel", "close"])(
    "opens the correct request editor and handles %s",
    async (action) => {
      vi.spyOn(console, "log").mockImplementation(() => {});
      await mount();
      await menu();
      await userEvent.click(screen.getByRole("menuitem", { name: "Edit request" }));
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
    if (result === "empty") expect(await screen.findByText("No requests yet")).toBeInTheDocument();
    else
      expect(await screen.findByRole("alert")).toHaveTextContent(
        result === "error" ? "Offline" : "Could not load requests",
      );
  });
  it("shows placeholders while loading", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    expect(
      render(
        <MemoryRouter>
          <UserRequests />
        </MemoryRouter>,
      ).container.querySelector(".animate-pulse"),
    ).toBeInTheDocument();
  });
});
