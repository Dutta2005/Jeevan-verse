// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import authReducer, { login, loginOrganization } from "../../../store/authSlice";
import themeReducer, { toggleTheme } from "../../../store/themeSlice";
import Layout from "../Layout";

vi.mock("../../../components/organisation/navbar/Sidebar", () => ({
  default: ({ isLoggedIn, theme }: { isLoggedIn: boolean; theme: string }) => (
    <div data-testid="org-sidebar">{`${isLoggedIn}:${theme}`}</div>
  ),
}));

function renderLayout(account: "signed-out" | "user" | "organization", light = false) {
  const store = configureStore({ reducer: { auth: authReducer, theme: themeReducer } });
  if (account === "user") {
    store.dispatch(login({ _id: "user-1", name: "Asha", info: { bloodGroup: "O+" } }));
  }
  if (account === "organization") {
    store.dispatch(loginOrganization({ _id: "org-1", name: "Clinic" }));
  }
  if (light) store.dispatch(toggleTheme());

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/organisation"]}>
        <Routes>
          <Route path="/organisation" element={<Layout />}>
            <Route index element={<p>Organization outlet</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("Organization layout", () => {
  it("shows organization navigation and applies the dark theme to the body", () => {
    document.body.classList.remove("dark");
    renderLayout("organization");

    expect(screen.getByTestId("org-sidebar")).toHaveTextContent("true:dark");
    expect(screen.getByText("Organization outlet")).toBeInTheDocument();
    expect(document.body).toHaveClass("dark");
  });

  it("marks individuals and signed-out visitors as not logged in as an organization", () => {
    const { rerender } = renderLayout("user", true);
    expect(screen.getByTestId("org-sidebar")).toHaveTextContent("false:light");
    expect(document.body).not.toHaveClass("dark");

    rerender(
      <Provider
        store={configureStore({ reducer: { auth: authReducer, theme: themeReducer } })}
      >
        <MemoryRouter initialEntries={["/organisation"]}>
          <Routes>
            <Route path="/organisation" element={<Layout />}>
              <Route index element={<p>Organization outlet</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByTestId("org-sidebar")).toHaveTextContent("false:dark");
  });
});
