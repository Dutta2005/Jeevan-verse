// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import Sidebar from "../Sidebar";
import { toggleTheme } from "../../../../store/themeSlice";

const dispatch = vi.hoisted(() => vi.fn());
vi.mock("react-redux", () => ({ useDispatch: () => dispatch }));
vi.mock("../../OrgLogoutBtn", () => ({ default: () => <button>Logout</button> }));
beforeEach(() => {
  dispatch.mockReset();
});

describe("organization sidebar", () => {
  it("shows organization routes and toggles dark mode", async () => {
    render(
      <MemoryRouter initialEntries={["/organisation"]}>
        <Sidebar isLoggedIn theme="light" />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/organisation/org-profile/0",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute(
      "href",
      "/organisation/posts",
    );
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch"));
    expect(dispatch).toHaveBeenCalledWith(toggleTheme());
  });
  it("shows visitor account routes in dark mode", async () => {
    render(
      <MemoryRouter initialEntries={["/signin"]}>
        <Sidebar isLoggedIn={false} theme="dark" />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("link", { name: "Login" })).toHaveAttribute("href", "/signin");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("switch")).toBeChecked();
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
  });
});
