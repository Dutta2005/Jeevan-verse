// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import authReducer, { loginOrganization } from "../../../../store/authSlice";
import Header from "../Header";

describe("organization dashboard header", () => {
  it("greets the organization and links to the post form", () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    store.dispatch(loginOrganization({ _id: "org1", name: "City Clinic" }));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByRole("heading", { name: "City Clinic" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create post" })).toHaveAttribute(
      "href",
      "/organisation/create",
    );
  });
});
