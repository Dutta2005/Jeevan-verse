// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import authReducer, { loginOrganization } from "../../../store/authSlice";
import OrgHome from "../OrgHome";

vi.mock("@/components/organisation/dashboard/Header", () => ({
  default: () => <div>Organization header</div>,
}));
vi.mock("@/components/organisation/dashboard/PastActivities", () => ({
  default: () => <div>Organization activities</div>,
}));
vi.mock("@/components/organisation/OrgLandingPage", () => ({
  default: () => <div>Organization landing</div>,
}));

function renderHome(authenticated: boolean) {
  const store = configureStore({ reducer: { auth: authReducer } });
  if (authenticated) {
    store.dispatch(loginOrganization({ _id: "org1", name: "Clinic" }));
  }
  return render(
    <Provider store={store}>
      <OrgHome />
    </Provider>,
  );
}

describe("OrgHome", () => {
  it("shows the organization landing page before sign-in", () => {
    renderHome(false);
    expect(screen.getByText("Organization landing")).toBeInTheDocument();
  });

  it("shows the organization dashboard after sign-in", () => {
    renderHome(true);
    expect(screen.getByText("Organization header")).toBeInTheDocument();
    expect(screen.getByText("Organization activities")).toBeInTheDocument();
  });
});
