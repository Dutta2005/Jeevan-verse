// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import Error404 from "../Error404";
import SomethingWrong from "../SomethingWrong";

describe("error screens", () => {
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

    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to Homepage" }));
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
