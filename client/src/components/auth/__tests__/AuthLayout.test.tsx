// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import themeReducer from "@/store/themeSlice";
import { AuthLayout } from "../AuthLayout";

describe("account layout", () => {
  it.each(["individual", "organization"] as const)(
    "offers %s account routes in both modes",
    async (audience) => {
      const store = configureStore({ reducer: { theme: themeReducer } });
      const view = render(
        <Provider store={store}>
          <MemoryRouter>
            <AuthLayout audience={audience} mode="login" title="Sign in" description="Your account">
              <p>Account form</p>
            </AuthLayout>
          </MemoryRouter>
        </Provider>,
      );
      expect(screen.getByRole("link", { name: "Individual" })).toHaveAttribute("href", "/login");
      expect(screen.getByRole("link", { name: "Organization" })).toHaveAttribute("href", "/signin");
      expect(
        screen.getByRole("link", {
          name: audience === "individual" ? "Individual" : "Organization",
        }),
      ).toHaveAttribute("aria-current", "page");
      await userEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
      expect(document.documentElement).not.toHaveClass("dark");
      await userEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
      expect(document.documentElement).toHaveClass("dark");
      view.rerender(
        <Provider store={store}>
          <MemoryRouter>
            <AuthLayout
              audience={audience}
              mode="signup"
              title="Join"
              description="Create an account"
            >
              <p>Account form</p>
            </AuthLayout>
          </MemoryRouter>
        </Provider>,
      );
      expect(screen.getByRole("link", { name: "Individual" })).toHaveAttribute("href", "/signup");
      expect(screen.getByRole("link", { name: "Organization" })).toHaveAttribute(
        "href",
        "/register",
      );
      expect(screen.getByText("Account form")).toBeInTheDocument();
    },
  );
});
