// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import OrgLandingPage from "../OrgLandingPage";

describe("organization landing page", () => {
  it("presents organization publishing and links to the existing account routes", () => {
    render(
      <MemoryRouter>
        <OrgLandingPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /Your work belongs\s*in the community/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Meet Jeevan Verse" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Already here? Sign in" })).toHaveAttribute(
      "href",
      "/signin",
    );
    expect(
      screen.getAllByRole("link", { name: "Create an organization account" })[0],
    ).toHaveAttribute("href", "/register");
    expect(screen.getByText(/Example post/)).toBeInTheDocument();
    expect(screen.queryByText("Active Campaigns")).not.toBeInTheDocument();
  });
});
