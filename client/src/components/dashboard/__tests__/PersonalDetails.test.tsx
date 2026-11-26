// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PersonalDetails from "../PersonalDetails";

const get = vi.hoisted(() => vi.fn());
vi.mock("../../../api/api", () => ({ api: { get } }));
beforeEach(() => {
  get.mockReset();
});

describe("personal details", () => {
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
      expect(screen.getByText("170 cm")).toBeInTheDocument();
      expect(screen.getByText("65 kg")).toBeInTheDocument();
      expect(screen.getByText("Test City, Test District, Test State")).toBeInTheDocument();
      if (status === "doctor") expect(screen.getByText("Doctor")).toBeInTheDocument();
      if (status === "medical student")
        expect(screen.getByText("Medical Student")).toBeInTheDocument();
      expect(screen.queryByText("Eligible Blood Donor") !== null).toBe(status === "doctor");
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
    await screen.findByText("Personal Details");
    expect(screen.queryByText("Email Address")).not.toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });
});
