// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BeVolunteer from "../BeVolunteer";

const mocks = vi.hoisted(() => ({ post: vi.fn(), toast: vi.fn() }));
vi.mock("../../../api/api", () => ({ api: { post: mocks.post } }));
vi.mock("../../../hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
beforeEach(() => vi.resetAllMocks());

describe("blood request volunteering consent", () => {
  it.each([
    ["Share", true],
    ["Continue without sharing", false],
  ] as const)("sends the explicit consent choice: %s", async (label, consent) => {
    mocks.post.mockResolvedValue({ status: 200 });
    render(<BeVolunteer id="request-1" />);
    await userEvent.click(screen.getByRole("button", { name: "Be a Volunteer" }));
    expect(mocks.post).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: label }));
    await waitFor(() =>
      expect(mocks.post).toHaveBeenCalledWith("/blood-requests/request-1/volunteer", {
        canShareDetails: consent,
      }),
    );
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "success" }));
  });
  it("reports failures without claiming volunteer registration succeeded", async () => {
    mocks.post.mockRejectedValue(new Error("Request unavailable"));
    render(<BeVolunteer id="request-1" />);
    await userEvent.click(screen.getByRole("button", { name: "Be a Volunteer" }));
    await userEvent.click(screen.getByRole("button", { name: "Continue without sharing" }));
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: "Request unavailable", variant: "destructive" }),
      ),
    );
  });
  it("does not announce success for an unexpected response status", async () => {
    mocks.post.mockResolvedValue({ status: 204 });
    render(<BeVolunteer id="request-1" />);
    await userEvent.click(screen.getByRole("button", { name: "Be a Volunteer" }));
    await userEvent.click(screen.getByRole("button", { name: "Share" }));
    expect(mocks.toast).not.toHaveBeenCalled();
  });
});
