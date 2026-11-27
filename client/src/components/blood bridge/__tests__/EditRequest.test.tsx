// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EditRequest from "../EditRequest";
import { selectOption } from "../../../test/selectOption";

const mocks = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), save: vi.fn(), cancel: vi.fn() }));
vi.mock("../../../api/api", () => ({ api: { get: mocks.get, patch: mocks.patch } }));
vi.mock("@/lib/india-locations", () => ({
  indianStates: [
    { name: "Test State", isoCode: "TS" },
    { name: "Other State", isoCode: "OS" },
  ],
  getIndianCities: async () => ["Test City", "Other City"],
}));
const request = {
  bloodGroup: "O+",
  urgency: "high",
  message: "Synthetic request",
  contactDetails: { phone: "0000000000", email: "request@example.test" },
  address: { state: "Test State", district: "Test District", city: "Test City" },
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.get.mockResolvedValue({ status: 200, data: { data: request } });
});
afterEach(() => vi.restoreAllMocks());
const mount = () =>
  render(<EditRequest requestId="r1" onSave={mocks.save} onCancel={mocks.cancel} />);

describe("blood request editor", () => {
  it.each(["resolve", "reject"])(
    "ignores a late editor response after unmount (%s)",
    async (outcome) => {
      let finish!: (value: unknown) => void;
      let fail!: (reason: unknown) => void;
      mocks.get.mockReturnValue(
        new Promise((resolve, reject) => {
          finish = resolve;
          fail = reject;
        }),
      );
      const view = mount();
      view.unmount();
      await act(async () => {
        if (outcome === "resolve") finish({ status: 200, data: { data: request } });
        else fail(new Error("Offline"));
      });
      expect(mocks.patch).not.toHaveBeenCalled();
    },
  );
  it("fills missing optional response fields with editable blanks", async () => {
    mocks.get.mockResolvedValue({
      status: 200,
      data: { data: { bloodGroup: "O+", urgency: "high" } },
    });
    mount();
    expect(await screen.findByLabelText("Phone *")).toHaveValue("");
    expect(screen.getByLabelText("District *")).toHaveValue("");
    expect(screen.getByLabelText("City / town *")).toHaveValue("");
  });
  it("clears the previous draft when opening another request", async () => {
    const view = mount();
    await screen.findByDisplayValue("Synthetic request");
    mocks.get.mockReturnValue(new Promise(() => {}));
    view.rerender(<EditRequest requestId="r2" onSave={mocks.save} onCancel={mocks.cancel} />);
    expect(screen.queryByDisplayValue("Synthetic request")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Loading request details")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenLastCalledWith("/blood-requests/r2");
  });
  it("loads the record, changes fields, and saves a nested payload", async () => {
    mocks.patch.mockResolvedValue({ status: 200 });
    const { container } = mount();
    await screen.findByDisplayValue("Synthetic request");
    expect(mocks.get).toHaveBeenCalledWith("/blood-requests/r1");
    await selectOption(0, "A+");
    await selectOption(1, "Low");
    await selectOption(2, "Other State");
    fireEvent.change(screen.getByLabelText("City / town *"), { target: { value: "Other City" } });
    fireEvent.change(screen.getByPlaceholderText("Hospital, timing, or other useful details"), {
      target: { value: "Updated request" },
    });
    fireEvent.change(container.querySelector('input[type="tel"]')!, {
      target: { value: "1111111111" },
    });
    fireEvent.change(container.querySelector('input[type="email"]')!, {
      target: { value: "updated@example.test" },
    });
    fireEvent.change(screen.getByLabelText("District *"), {
      target: { value: "Other District" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(mocks.patch).toHaveBeenCalledWith("/blood-requests/update/r1", {
      bloodGroup: "A+",
      urgency: "low",
      message: "Updated request",
      contactDetails: { phone: "1111111111", email: "updated@example.test" },
      address: { state: "Other State", district: "Other District", city: "Other City" },
    });
  });
  it("omits empty optional values from the update", async () => {
    mocks.get.mockResolvedValue({
      status: 200,
      data: { data: { ...request, message: undefined, contactDetails: { phone: "0000000000" } } },
    });
    mocks.patch.mockResolvedValue({ status: 200 });
    mount();
    await screen.findByRole("button", { name: "Save changes" });
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(mocks.patch).toHaveBeenCalledWith(
      "/blood-requests/update/r1",
      expect.objectContaining({
        message: undefined,
        contactDetails: { phone: "0000000000", email: undefined },
      }),
    );
  });
  it("validates edits and lets the user cancel", async () => {
    const { container } = mount();
    await screen.findByDisplayValue("Synthetic request");
    fireEvent.change(container.querySelector('input[type="tel"]')!, { target: { value: "bad" } });
    fireEvent.submit(screen.getByRole("button", { name: "Save changes" }).closest("form")!);
    expect(mocks.patch).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mocks.cancel).toHaveBeenCalledTimes(1);
  });
  it.each(["error", "unexpected"])("does not call onSave after update %s", async (result) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (result === "error") mocks.patch.mockRejectedValue(new Error("Offline"));
    else mocks.patch.mockResolvedValue({ status: 204 });
    mount();
    await screen.findByRole("button", { name: "Save changes" });
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    if (result === "error")
      expect(
        await screen.findByText("Failed to update the request. Please try again."),
      ).toBeInTheDocument();
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it.each(["error", "unexpected"])("handles a fetch %s", async (result) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (result === "error") mocks.get.mockRejectedValue(new Error("Offline"));
    else mocks.get.mockResolvedValue({ status: 204 });
    mount();
    expect(await screen.findByText("Failed to load request details.")).toBeInTheDocument();
  });
  it("shows loading feedback", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    mount();
    expect(screen.getByLabelText("Loading request details")).toBeInTheDocument();
  });
});
