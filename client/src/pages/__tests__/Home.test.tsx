// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import authReducer, { login, loginOrganization } from "../../store/authSlice";
import Home from "../Home";

vi.mock("@/components/dashboard/Dashboard", () => ({
  default: () => <div>User dashboard</div>,
}));
vi.mock("../LandingPage", () => ({
  default: () => <div>Public landing page</div>,
}));

function makeStore(account: "signed-out" | "user" | "organization") {
  const store = configureStore({ reducer: { auth: authReducer } });

  if (account === "user") {
    store.dispatch(login({ _id: "user-1", name: "Asha", info: { bloodGroup: "O+" } }));
  }
  if (account === "organization") {
    store.dispatch(loginOrganization({ _id: "org-1", name: "Clinic" }));
  }

  return store;
}

function renderHome(account: "signed-out" | "user" | "organization") {
  return render(
    <Provider store={makeStore(account)}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/organisation" element={<p>Organization home route</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("Home page", () => {
  it("shows the public landing page to a signed-out visitor", () => {
    renderHome("signed-out");
    expect(screen.getByText("Public landing page")).toBeInTheDocument();
  });

  it("shows the dashboard to a signed-in individual user", () => {
    renderHome("user");
    expect(screen.getByText("User dashboard")).toBeInTheDocument();
  });

  it("redirects organizations to their organization home", async () => {
    renderHome("organization");
    await waitFor(() => expect(screen.getByText("Organization home route")).toBeInTheDocument());
  });
});
