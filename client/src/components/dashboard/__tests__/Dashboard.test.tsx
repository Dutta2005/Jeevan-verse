// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import authReducer, { login } from "../../../store/authSlice";
import Dashboard from "../Dashboard";
import { MemoryRouter } from "react-router";

vi.mock("../PersonalDetails", () => ({ default: () => <div>Profile details</div> }));
vi.mock("../LatestsPosts", () => ({ LatestsPosts: () => <div>Recent posts</div> }));

describe("Dashboard", () => {
  it("renders both dashboard sections without duplicating the toolbar heading", () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    store.dispatch(login({ _id: "u1", name: "Asha", info: { bloodGroup: "O+" } }));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.queryByRole("heading", { name: "Home" })).not.toBeInTheDocument();
    expect(screen.getByText("Profile details")).toBeInTheDocument();
    expect(screen.getByText("Recent posts")).toBeInTheDocument();
  });
});
