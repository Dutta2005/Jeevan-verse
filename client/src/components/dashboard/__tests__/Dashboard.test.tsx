// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import authReducer, { login } from "../../../store/authSlice";
import Dashboard from "../Dashboard";

vi.mock("../PersonalDetails", () => ({ default: () => <div>Profile details</div> }));
vi.mock("../LatestsPosts", () => ({ LatestsPosts: () => <div>Recent posts</div> }));

describe("Dashboard", () => {
  it("greets the signed-in user and renders both dashboard sections", () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    store.dispatch(login({ _id: "u1", name: "Asha", info: { bloodGroup: "O+" } }));

    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>,
    );

    expect(screen.getByRole("heading", { name: "Welcome back, Asha" })).toBeInTheDocument();
    expect(screen.getByText("Profile details")).toBeInTheDocument();
    expect(screen.getByText("Recent posts")).toBeInTheDocument();
  });
});
