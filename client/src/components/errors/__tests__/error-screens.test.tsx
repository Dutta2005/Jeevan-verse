// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import Error404 from "../Error404";
import SomethingWrong from "../SomethingWrong";

const account = vi.hoisted(() => ({ role: "user" }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) => select({ auth: { role: account.role } }),
}));

describe("error screens", () => {
  it.each(["/missing", "/organisation/missing"])(
    "uses the correct home when going back from %s",
    async (path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={path} element={<Error404 />} />
            <Route path="/" element={<p>Home page</p>} />
            <Route path="/organisation" element={<p>Organization home page</p>} />
          </Routes>
        </MemoryRouter>,
      );
      await userEvent.click(screen.getByRole("button", { name: "Go back" }));
      expect(
        screen.getByText(path.startsWith("/organisation") ? "Organization home page" : "Home page"),
      ).toBeInTheDocument();
    },
  );
  it("goes back through browser history when a preceding entry exists", () => {
    window.history.replaceState({ idx: 1 }, "");
    render(
      <MemoryRouter initialEntries={["/previous", "/missing"]} initialIndex={1}>
        <Routes>
          <Route path="/missing" element={<Error404 />} />
          <Route path="/previous" element={<p>Previous page</p>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(screen.getByText("Previous page")).toBeInTheDocument();
    window.history.replaceState(null, "");
  });
  it("lets a user return home from the 404 screen", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/missing"]}>
        <Routes>
          <Route path="/missing" element={<Error404 />} />
          <Route path="/" element={<p>Home page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Back to home" }));
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("shows recovery guidance and lets a user navigate home", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/error"]}>
        <Routes>
          <Route path="/error" element={<SomethingWrong />} />
          <Route path="/" element={<p>Home page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("System recovery in progress")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to Homepage" }));
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });
});
