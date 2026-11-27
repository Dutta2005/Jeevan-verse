// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RequestForm from "../RequestForm";
import { selectOption } from "../../../test/selectOption";

const mocks = vi.hoisted(() => ({ post: vi.fn(), navigate: vi.fn() }));
vi.mock("../../../api/api", () => ({ api: { post: mocks.post } }));
vi.mock("react-router", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("country-state-city", () => ({
  State: { getStatesOfCountry: () => [{ name: "Test State", isoCode: "TS" }] },
  City: { getCitiesOfState: () => [{ name: "Test City" }] },
}));
beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.restoreAllMocks());
const mount = async () => {
  render(<RequestForm />);
  await userEvent.click(screen.getByRole("button", { name: "Create request" }));
};
const fill = async () => {
  await selectOption(0, "O+");
  await selectOption(1, "High");
  fireEvent.change(screen.getByLabelText("Message (optional)"), {
    target: { value: "Synthetic request" },
  });
  fireEvent.change(screen.getByLabelText("Phone *"), { target: { value: "0000000000" } });
  fireEvent.change(screen.getByLabelText("Email (optional)"), {
    target: { value: "request@example.test" },
  });
  await selectOption(2, "Test State");
  fireEvent.change(screen.getByLabelText("District *"), { target: { value: "Test District" } });
  fireEvent.change(screen.getByLabelText("City / town *"), { target: { value: "Test City" } });
};

describe("blood request creation", () => {
  it("preserves a draft when the request drawer is dismissed", async () => {
    await mount();
    fireEvent.change(screen.getByLabelText("Message (optional)"), {
      target: { value: "Draft request" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await userEvent.click(screen.getByRole("button", { name: "Create request" }));
    expect(screen.getByLabelText("Message (optional)")).toHaveValue("Draft request");
  });
  it("validates required fields before submitting", async () => {
    await mount();
    fireEvent.submit(screen.getByRole("button", { name: "Publish request" }).closest("form")!);
    expect(await screen.findByText("Phone number must be at least 10 digits")).toBeInTheDocument();
    expect(screen.getByText("State is required")).toBeInTheDocument();
    expect(screen.getByText("District is required")).toBeInTheDocument();
    expect(screen.getByText("City is required")).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("submits the nested request payload and navigates to the created record", async () => {
    mocks.post.mockResolvedValue({ status: 201, data: { data: { bloodRequest: { _id: "r1" } } } });
    await mount();
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "Publish request" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/bloodbridge/request/r1"));
    expect(mocks.post).toHaveBeenCalledWith("/blood-requests/create", {
      bloodGroup: "O+",
      urgency: "high",
      message: "Synthetic request",
      status: "pending",
      contactDetails: { phone: "0000000000", email: "request@example.test" },
      address: { state: "Test State", district: "Test District", city: "Test City" },
    });
    await waitFor(() => expect(screen.queryByLabelText("Phone *")).not.toBeInTheDocument());
  });
  it.each(["error", "unexpected"])("preserves input after a submission %s", async (result) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (result === "error") mocks.post.mockRejectedValue(new Error("Offline"));
    else mocks.post.mockResolvedValue({ status: 200 });
    await mount();
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "Publish request" }));
    if (result === "error")
      expect(
        await screen.findByText("Failed to submit the form. Please try again."),
      ).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Phone *")).toHaveValue("0000000000");
  });
  it("validates phone format and email and clears an error when corrected", async () => {
    await mount();
    fireEvent.change(screen.getByLabelText("Phone *"), { target: { value: "abcdefghij" } });
    fireEvent.change(screen.getByLabelText("Email (optional)"), { target: { value: "invalid" } });
    fireEvent.submit(screen.getByRole("button", { name: "Publish request" }).closest("form")!);
    expect(await screen.findByText("Invalid phone number format")).toBeInTheDocument();
    expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Phone *"), { target: { value: "0000000000" } });
    expect(screen.queryByText("Invalid phone number format")).not.toBeInTheDocument();
  });
});
