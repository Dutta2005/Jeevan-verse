// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Sidebar from "../Sidebar";
import { toggleTheme } from "../../../store/themeSlice";

const mocks = vi.hoisted(() => ({ dispatch: vi.fn(), authenticated: true, theme: "light" }));
vi.mock("react-redux", () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: {
        isAuthenticated: mocks.authenticated,
        user: mocks.authenticated ? { name: "Test Person" } : null,
      },
      theme: { theme: mocks.theme },
    }),
}));
vi.mock("../../Logoutbtn", () => ({ default: () => <button>Logout</button> }));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticated = true;
  mocks.theme = "light";
});

describe("user sidebar", () => {
  it("shows the user's first name and routes, and dispatches theme changes", async () => {
    render(
      <MemoryRouter initialEntries={["/discussions"]}>
        <Sidebar />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Test")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute("href", "/discussions");
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch"));
    expect(mocks.dispatch).toHaveBeenCalledWith(toggleTheme());
  });
  it("supports anonymous visitors in dark mode", async () => {
    mocks.authenticated = false;
    mocks.theme = "dark";
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("switch")).toBeChecked();
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
  });
});
