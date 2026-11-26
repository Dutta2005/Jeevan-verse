// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Logoutbtn from "../Logoutbtn";
import { logout } from "../../store/authSlice";

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  dispatch: vi.fn(),
  navigate: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("../../api/api", () => ({ api: { post: mocks.post } }));
vi.mock("react-redux", () => ({ useDispatch: () => mocks.dispatch }));
vi.mock("react-router", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("../../hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
beforeEach(() => vi.resetAllMocks());

describe("user logout", () => {
  it.each([200, 204])("clears local auth and returns home after status %i", async (status) => {
    mocks.post.mockResolvedValue({ status });
    render(<Logoutbtn />);
    await userEvent.click(screen.getByRole("button", { name: "Logout" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/", { replace: true }));
    expect(mocks.post).toHaveBeenCalledWith("/users/logout");
    expect(mocks.dispatch).toHaveBeenCalledWith(logout());
    expect(mocks.toast).toHaveBeenCalledTimes(status === 200 ? 1 : 0);
  });
  it("clears local auth and explains a failed logout request", async () => {
    mocks.post.mockRejectedValue(new Error("Offline"));
    render(<Logoutbtn />);
    await userEvent.click(screen.getByRole("button", { name: "Logout" }));
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: "Offline", variant: "destructive" }),
      ),
    );
    expect(mocks.dispatch).toHaveBeenCalledWith(logout());
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
