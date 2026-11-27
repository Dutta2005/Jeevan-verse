// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EditRequest from "../EditRequest";
import { selectOption } from "../../../test/selectOption";

const mocks = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), save: vi.fn(), cancel: vi.fn() }));
vi.mock("../../../api/api", () => ({ api: { get: mocks.get, patch: mocks.patch } }));
vi.mock("country-state-city", () => ({
  State: {
    getStatesOfCountry: () => [
      { name: "Test State", isoCode: "TS" },
      { name: "Other State", isoCode: "OS" },
    ],
  },
  City: { getCitiesOfState: () => [{ name: "Test City" }, { name: "Other City" }] },
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
  it("loads the record, changes fields, and saves a nested payload", async () => {
    mocks.patch.mockResolvedValue({ status: 200 });
    const { container } = mount();
    await screen.findByDisplayValue("Synthetic request");
    expect(mocks.get).toHaveBeenCalledWith("/blood-requests/r1");
    await selectOption(0, "A+");
    await selectOption(1, "Low");
    await selectOption(2, "Other State");
    await selectOption(3, "Other City");
    fireEvent.change(screen.getByPlaceholderText("Optional message"), {
      target: { value: "Updated request" },
    });
    fireEvent.change(container.querySelector('input[type="tel"]')!, {
      target: { value: "1111111111" },
    });
    fireEvent.change(container.querySelector('input[type="email"]')!, {
      target: { value: "updated@example.test" },
    });
    fireEvent.change(screen.getByDisplayValue("Test District"), {
      target: { value: "Other District" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));
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
    await screen.findByRole("button", { name: "Save Changes" });
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));
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
    fireEvent.submit(screen.getByRole("button", { name: "Save Changes" }).closest("form")!);
    expect(mocks.patch).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mocks.cancel).toHaveBeenCalledTimes(1);
  });
  it.each(["error", "unexpected"])("does not call onSave after update %s", async (result) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (result === "error") mocks.patch.mockRejectedValue(new Error("Offline"));
    else mocks.patch.mockResolvedValue({ status: 204 });
    mount();
    await screen.findByRole("button", { name: "Save Changes" });
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));
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
    expect(screen.getByText("Loading request details...")).toBeInTheDocument();
  });
});
