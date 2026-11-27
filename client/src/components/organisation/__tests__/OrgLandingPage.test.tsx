// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import OrgLandingPage from "../OrgLandingPage";

const navigate = vi.hoisted(() => vi.fn());
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));

describe("organization landing page", () => {
  it("renders campaigns and directs visitors to signup and sign-in", async () => {
    render(
      <MemoryRouter>
        <OrgLandingPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /for organisations/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Get Started" }));
    expect(navigate).toHaveBeenCalledWith("/register");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(navigate).toHaveBeenCalledWith("/signin");
    expect(screen.getByRole("heading", { name: "Contact Us" })).toBeInTheDocument();
  });
});
