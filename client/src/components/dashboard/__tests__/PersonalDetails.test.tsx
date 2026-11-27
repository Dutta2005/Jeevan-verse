// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PersonalDetails from "../PersonalDetails";
import userEvent from "@testing-library/user-event";

const get = vi.hoisted(() => vi.fn());
vi.mock("../../../api/api", () => ({ api: { get } }));
beforeEach(() => {
  get.mockReset();
});

describe("personal details", () => {
  it.each(["resolve", "reject"])(
    "ignores late profile results after unmount (%s)",
    async (outcome) => {
      let finish!: (value: unknown) => void;
      let fail!: (reason: unknown) => void;
      get.mockReturnValue(
        new Promise((resolve, reject) => {
          finish = resolve;
          fail = reject;
        }),
      );
      const view = render(<PersonalDetails />);
      view.unmount();
      await act(async () => {
        if (outcome === "resolve") finish({ data: { data: { email: "person@example.test" } } });
        else fail(new Error("Offline"));
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );
  it("labels missing optional profile fields and can collapse the details", async () => {
    get.mockResolvedValue({ data: { data: { email: "", phone: "", status: "other" } } });
    render(<PersonalDetails />);
    await userEvent.click(await screen.findByRole("button", { name: "Profile details" }));
    expect(screen.getAllByText("Not added")).toHaveLength(6);
    await userEvent.click(screen.getByRole("button", { name: "Less detail" }));
    expect(screen.queryByText("Phone")).not.toBeInTheDocument();
  });
  it.each(["doctor", "medical student", "other"])(
    "shows the returned profile for %s",
    async (status) => {
      get.mockResolvedValue({
        data: {
          data: {
            status,
            canDonate: status === "doctor",
            email: "person@example.test",
            phone: "0000000000",
            info: { bloodGroup: "O+", height: 170, weight: 65 },
            address: { city: "Test City", district: "Test District", state: "Test State" },
          },
        },
      });
      render(<PersonalDetails />);
      expect(await screen.findByText("person@example.test")).toBeInTheDocument();
      expect(get).toHaveBeenCalledWith("/users/current-user/details");
      const profileToggle = screen.getByRole("button", { name: "Profile details" });
      expect(profileToggle).toHaveAttribute("aria-expanded", "false");
      await userEvent.click(profileToggle);
      expect(profileToggle).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("170 cm")).toBeInTheDocument();
      expect(screen.getByText("65 kg")).toBeInTheDocument();
      expect(screen.getByText("Test City, Test District, Test State")).toBeInTheDocument();
      if (status === "doctor") expect(screen.getByText("Doctor")).toBeInTheDocument();
      if (status === "medical student")
        expect(screen.getByText("Medical Student")).toBeInTheDocument();
      expect(screen.queryByText("Eligible Blood Donor")).not.toBeInTheDocument();
      expect(
        screen.getByText("Profile details do not establish blood donor eligibility."),
      ).toBeInTheDocument();
    },
  );
  it("shows placeholders while loading", () => {
    get.mockReturnValue(new Promise(() => {}));
    const { container } = render(<PersonalDetails />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
  it("shows a recoverable fetch error", async () => {
    get.mockRejectedValue(new Error("Offline"));
    render(<PersonalDetails />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
  });
  it("handles an empty profile response", async () => {
    get.mockResolvedValue({ data: { data: null } });
    const { container } = render(<PersonalDetails />);
    await screen.findByText("Your profile");
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });
});
