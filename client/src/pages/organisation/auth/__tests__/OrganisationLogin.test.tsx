// @vitest-environment jsdom
import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrganisationLogin from "../OrganisationLogin";
import { loginOrganization } from "../../../../store/authSlice";

vi.mock("@/components/auth/AuthLayout", () => ({
  AuthLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  dispatch: vi.fn(),
  navigate: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("../../../../api/api", () => ({ api: { post: mocks.post } }));
vi.mock("react-redux", () => ({ useDispatch: () => mocks.dispatch }));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => mocks.navigate,
}));
vi.mock("../../../../hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
beforeEach(() => vi.resetAllMocks());
const mount = () =>
  render(
    <MemoryRouter>
      <OrganisationLogin />
    </MemoryRouter>,
  );
const submit = () => {
  fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
    target: { value: "org@example.test" },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
    target: { value: "test-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
};

describe("organization login", () => {
  it("validates blank credentials without calling the API", async () => {
    mount();
    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }).closest("form")!);
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("dispatches the returned organization and navigates on success", async () => {
    const organization = {
      id: "org-1",
      name: "Test organization",
      email: "org@example.test",
      type: "nonprofit",
      website: "",
      description: "",
    };
    mocks.post.mockResolvedValue({ status: 200, data: { data: { organization } } });
    mount();
    submit();
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/organisation"));
    expect(mocks.post).toHaveBeenCalledWith("/organizations/login", {
      email: "org@example.test",
      password: "test-password",
    });
    expect(mocks.dispatch).toHaveBeenCalledWith(loginOrganization(organization));
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Login Successful" }),
    );
  });
  it("prevents another submit while signing in", async () => {
    mocks.post.mockReturnValue(new Promise(() => {}));
    mount();
    submit();
    expect(await screen.findByRole("button", { name: "Signing in..." })).toBeDisabled();
  });
  it.each(["error", "unexpected"])("does not authenticate on %s", async (result) => {
    if (result === "error") mocks.post.mockRejectedValue(new Error("Offline"));
    else mocks.post.mockResolvedValue({ status: 204 });
    mount();
    submit();
    await waitFor(() => expect(mocks.post).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled());
    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
    if (result === "error")
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Login Failed", description: "Offline" }),
      );
  });
});
