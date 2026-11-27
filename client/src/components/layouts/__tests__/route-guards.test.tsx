// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authReducer, { login, loginOrganization } from "../../../store/authSlice";
import Protected from "../Protected";
import PublicRoutes from "../Public";

const mocks = vi.hoisted(() => ({ toast: vi.fn() }));
vi.mock("../../../hooks/use-toast", () => ({
  useToast: () => ({ toast: mocks.toast }),
}));

function makeStore(account: "signed-out" | "user" | "organization") {
  const store = configureStore({ reducer: { auth: authReducer } });

  if (account === "user") {
    store.dispatch(login({ _id: "u1", name: "Asha", info: { bloodGroup: "O+" } }));
  }
  if (account === "organization") {
    store.dispatch(loginOrganization({ _id: "org1", name: "Clinic" }));
  }

  return store;
}

function renderGuard(
  guard: React.ReactNode,
  path: string,
  account: "signed-out" | "user" | "organization",
) {
  window.history.replaceState({}, "", path);
  return render(
    <Provider store={makeStore(account)}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={guard} />
          <Route path="/login" element={<p>Login route</p>} />
          <Route path="/signin" element={<p>Organization sign-in route</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("Protected", () => {
  beforeEach(() => mocks.toast.mockClear());

  it("allows unauthenticated access to the public home route", () => {
    renderGuard(
      <Protected>
        <p>Home content</p>
      </Protected>,
      "/",
      "signed-out",
    );

    expect(screen.getByText("Home content")).toBeInTheDocument();
  });

  it("redirects an unauthenticated user to sign in and shows an explanation", async () => {
    renderGuard(
      <Protected>
        <p>Private content</p>
      </Protected>,
      "/private",
      "signed-out",
    );

    expect(await screen.findByText("Login route")).toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Unauthorized",
          variant: "destructive",
        }),
      ),
    );
  });

  it("redirects role mismatches to the organization sign-in route", () => {
    renderGuard(
      <Protected role="organization">
        <p>Organization content</p>
      </Protected>,
      "/organization/private",
      "user",
    );

    expect(screen.getByText("Organization sign-in route")).toBeInTheDocument();
  });

  it("allows a signed-in user through a matching role guard", () => {
    renderGuard(
      <Protected role="user">
        <p>User content</p>
      </Protected>,
      "/user/private",
      "user",
    );

    expect(screen.getByText("User content")).toBeInTheDocument();
  });
});

describe("PublicRoutes", () => {
  it("renders public content for a signed-out visitor", () => {
    renderGuard(
      <PublicRoutes role="user">
        <p>Public content</p>
      </PublicRoutes>,
      "/public",
      "signed-out",
    );

    expect(screen.getByText("Public content")).toBeInTheDocument();
  });

  it("renders public content when the signed-in role differs from the restricted role", () => {
    renderGuard(
      <PublicRoutes role="organization">
        <p>Organization public page</p>
      </PublicRoutes>,
      "/organization",
      "user",
    );

    expect(screen.getByText("Organization public page")).toBeInTheDocument();
  });

  it("renders no children when the signed-in role matches the restricted role", () => {
    renderGuard(
      <PublicRoutes role="user">
        <p>Signed-in user content</p>
      </PublicRoutes>,
      "/account",
      "user",
    );

    expect(screen.queryByText("Signed-in user content")).not.toBeInTheDocument();
  });
});
