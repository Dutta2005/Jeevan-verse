// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BloodRequestFields from "../BloodRequestFields";
import { emptyRequest } from "../blood-request-form";

const load = vi.hoisted(() => vi.fn());
vi.mock("@/lib/india-locations", () => ({
  indianStates: [{ name: "West Bengal", isoCode: "WB" }],
  getIndianCities: load,
}));

describe("blood request city suggestions", () => {
  it("keeps manual entry available through a failed city download and a retry", async () => {
    load.mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce(["Kolkata"]);
    const change = vi.fn();
    const { container } = render(
      <BloodRequestFields
        data={{ ...emptyRequest, state: "West Bengal" }}
        errors={{}}
        onChange={change}
        disabled={false}
      />,
    );
    expect(screen.getByText("Loading city suggestions…")).toBeInTheDocument();
    await screen.findByText(/You can still enter your city or town/);
    fireEvent.change(screen.getByLabelText("City / town *"), { target: { value: "My town" } });
    expect(change).toHaveBeenCalledWith("city", "My town");
    await userEvent.click(screen.getByRole("button", { name: "Retry city suggestions" }));
    await waitFor(() =>
      expect(container.querySelector('datalist option[value="Kolkata"]')).toBeInTheDocument(),
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
