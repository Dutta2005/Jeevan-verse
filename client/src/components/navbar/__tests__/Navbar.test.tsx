// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "../Navbar";
import { toggleTheme } from "../../../store/themeSlice";

const mocks = vi.hoisted(() => ({ dispatch: vi.fn(), authenticated: true, theme: "light" }));
vi.mock("react-redux", () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { isAuthenticated: mocks.authenticated }, theme: { theme: mocks.theme } }),
}));
vi.mock("../../Logoutbtn", () => ({ default: () => <button>Logout</button> }));
vi.mock("../Sidebar", () => ({ default: () => <p>Mobile navigation</p> }));
vi.mock("../Notifications", () => ({ default: () => <p>Notification menu</p> }));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticated = true;
  mocks.theme = "light";
});

describe("user navigation", () => {
  it.each(["light", "dark"])("renders signed-in navigation and toggles %s mode", async (theme) => {
    mocks.theme = theme;
    render(
      <MemoryRouter initialEntries={["/discussions"]}>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByText("Notification menu")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Jeevan Verse" })).toHaveAttribute("href", "/");
    await userEvent.click(
      screen.getByRole("button", {
        name: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      }),
    );
    expect(mocks.dispatch).toHaveBeenCalledWith(toggleTheme());
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Account menu"));
    expect(await screen.findByRole("menuitem", { name: "Logout" })).toBeInTheDocument();
  });
  it("hides notifications and logout for visitors", async () => {
    mocks.authenticated = false;
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.queryByText("Notification menu")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(mocks.dispatch).toHaveBeenCalledWith(toggleTheme());
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Account menu")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
  });
});
