// @vitest-environment jsdom
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("@/components/auth/AuthLayout", () => ({
  AuthLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  dispatch: vi.fn(),
  navigate: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("../../../api/api", () => ({ api: { post: mocks.post } }));
vi.mock("react-redux", () => ({ useDispatch: () => mocks.dispatch }));
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return { ...actual, useNavigate: () => mocks.navigate };
});
vi.mock("../../../hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));

import Login from "../Login";

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );

describe("Login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("submits credentials, dispatches login, and navigates on success", async () => {
    mocks.post.mockResolvedValue({ status: 200, data: { data: { user: { id: "u1" } } } });
    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(mocks.post).toHaveBeenCalledWith("/users/login", {
        email: "person@example.com",
        password: "secret",
      }),
    );
    expect(mocks.dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "auth/login" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/");
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Login Successful" }),
    );
  });

  it("shows the specific message for invalid credentials", async () => {
    mocks.post.mockRejectedValue({ isAxiosError: true, response: { status: 401 } });
    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Invalid email or password.",
        }),
      ),
    );
  });

  it.each(["Account unavailable", undefined])(
    "explains a rejected response: %s",
    async (message) => {
      mocks.post.mockResolvedValue({ status: 403, data: { message } });
      renderLogin();
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "person@example.test" },
      });
      fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
      await waitFor(() =>
        expect(mocks.toast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: message || "An error occurred during login. Please try again.",
          }),
        ),
      );
      expect(mocks.dispatch).not.toHaveBeenCalled();
      expect(mocks.navigate).not.toHaveBeenCalled();
    },
  );

  it("shows general recovery feedback for network failures", async () => {
    mocks.post.mockRejectedValue(new Error("Offline"));
    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: "Something went wrong" }),
      ),
    );
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });
});
