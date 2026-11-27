// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import BackButton from "../BackButton";

describe("BackButton", () => {
  it("navigates to the previous route and forwards custom classes", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/previous", "/current"]}>
        <Routes>
          <Route path="/previous" element={<p>Previous page</p>} />
          <Route
            path="/current"
            element={
              <>
                <BackButton cn="custom-class" />
                <p>Current page</p>
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Back" })).toHaveClass("custom-class");
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Previous page")).toBeInTheDocument();
  });
});
