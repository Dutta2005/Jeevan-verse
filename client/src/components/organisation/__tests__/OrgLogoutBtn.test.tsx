// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrgLogoutBtn from "../OrgLogoutBtn";
import { logout } from "../../../store/authSlice";

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  dispatch: vi.fn(),
  navigate: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("../../../api/api", () => ({ api: { post: mocks.post } }));
vi.mock("react-redux", () => ({ useDispatch: () => mocks.dispatch }));
vi.mock("react-router", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("../../../hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
beforeEach(() => vi.resetAllMocks());

describe("organization logout", () => {
  it("clears auth and returns to the organization landing page on success", async () => {
    mocks.post.mockResolvedValue({ status: 200 });
    render(<OrgLogoutBtn />);
    await userEvent.click(screen.getByRole("button", { name: "Logout" }));
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith("/organisation", { replace: true }),
    );
    expect(mocks.post).toHaveBeenCalledWith("/organizations/logout");
    expect(mocks.dispatch).toHaveBeenCalledWith(logout());
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "success" }));
  });
  it("does not clear auth for an unexpected response", async () => {
    mocks.post.mockResolvedValue({ status: 204 });
    render(<OrgLogoutBtn />);
    await userEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
  it("preserves auth and shows an error on failure", async () => {
    mocks.post.mockRejectedValue(new Error("Offline"));
    render(<OrgLogoutBtn />);
    await userEvent.click(screen.getByRole("button", { name: "Logout" }));
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Logout Failed", description: "Offline" }),
      ),
    );
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });
});
