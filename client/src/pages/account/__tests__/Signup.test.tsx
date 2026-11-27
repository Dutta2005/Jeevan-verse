// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Signup from "../Signup";

const mocks = vi.hoisted(() => ({ post: vi.fn(), navigate: vi.fn(), toast: vi.fn() }));
vi.mock("../../../api/api", () => ({ api: { post: mocks.post } }));
vi.mock("../../../hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => mocks.navigate,
}));
vi.mock("country-state-city", () => ({
  State: {
    getStatesOfCountry: () => [
      { name: "Test State", isoCode: "TS" },
      { name: "Other State", isoCode: "OS" },
    ],
  },
  City: { getCitiesOfState: () => [{ name: "Test City" }] },
}));
beforeEach(() => vi.resetAllMocks());
const mount = () =>
  render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>,
  );
const submit = () =>
  fireEvent.submit(screen.getByRole("button", { name: "Create Account" }).closest("form")!);
async function fill(age = "25") {
  for (const [placeholder, value] of [
    ["John Doe", "Test Person"],
    ["1234567890", "0000000000"],
    ["25", age],
    ["john.doe@example.com", "person@example.test"],
    ["Enter District", "Test District"],
    ["170", "170"],
    ["65", "65"],
    ["Create a strong password", "TestPassword1"],
    ["Confirm your password", "TestPassword1"],
  ]) {
    fireEvent.change(screen.getByPlaceholderText(placeholder!), { target: { value } });
  }
  await userEvent.selectOptions(screen.getAllByRole("combobox")[0]!, "Test State");
  await userEvent.selectOptions(screen.getAllByRole("combobox")[1]!, "Test City");
  await userEvent.selectOptions(screen.getByLabelText("Blood Group"), "O+");
  await userEvent.selectOptions(screen.getAllByRole("combobox")[3]!, "doctor");
  await userEvent.click(screen.getByRole("checkbox"));
}

describe("user registration", () => {
  it("validates required fields and consent before sending anything", () => {
    mount();
    submit();
    for (const message of [
      "Name is required",
      "Phone number must be 10 digits",
      "Email is required",
      "Password is required",
      "Age is required",
      "State is required",
      "District is required",
      "City is required",
      "Blood group is required",
      "Height is required",
      "Weight is required",
      "You must accept the terms and conditions",
    ])
      expect(screen.getByText(message)).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it.each(["25", "17"])(
    "submits a complete registration for age %s and returns to login",
    async (age) => {
      mocks.post.mockResolvedValue({ status: 201 });
      mount();
      await fill(age);
      submit();
      await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/login"));
      expect(mocks.post).toHaveBeenCalledWith("/users/register", {
        name: "Test Person",
        phone: "0000000000",
        email: "person@example.test",
        password: "TestPassword1",
        age,
        canDonate: Number(age) >= 18,
        status: "doctor",
        info: { bloodGroup: "O+", height: "170", weight: "65" },
        address: { state: "Test State", district: "Test District", city: "Test City" },
      });
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Registration Successful" }),
      );
    },
  );
  it("rejects mismatched passwords and resets the city when changing state", async () => {
    mount();
    await fill();
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: "different" },
    });
    await userEvent.selectOptions(screen.getAllByRole("combobox")[0]!, "Other State");
    expect(screen.getAllByRole("combobox")[1]).toHaveValue("");
    submit();
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(screen.getByText("City is required")).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it.each(["conflict", "network", "unexpected"])(
    "shows registration feedback for %s",
    async (result) => {
      if (result === "conflict")
        mocks.post.mockRejectedValue({ isAxiosError: true, response: { status: 409 } });
      else if (result === "network") mocks.post.mockRejectedValue(new Error("Offline"));
      else mocks.post.mockResolvedValue({ status: 200 });
      mount();
      await fill();
      submit();
      await waitFor(() =>
        expect(mocks.toast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "destructive",
            description:
              result === "conflict"
                ? "Email or phone number already exists"
                : "Something went wrong",
          }),
        ),
      );
      expect(mocks.navigate).not.toHaveBeenCalled();
    },
  );
});
