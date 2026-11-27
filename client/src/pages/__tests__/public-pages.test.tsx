// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import BloodBridge from "../BloodBridge";
import BloodDonationGuidelines from "../BloodDonationGuidelines";
import LandingPage from "../LandingPage";

vi.mock("../../components/blood bridge/RequestForm", () => ({
  default: () => <div>Request creation form</div>,
}));
vi.mock("../../components/blood bridge/Requests", () => ({
  default: ({ onCloseFilters }: { onCloseFilters: () => void }) => (
    <div>
      Active request list<button onClick={onCloseFilters}>Show requests</button>
    </div>
  ),
}));
vi.mock("../../components/blood bridge/UserRequests", () => ({
  default: () => <div>My request list</div>,
}));

describe("public landing page", () => {
  it("shows the primary value proposition, feature sections, and account actions", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /Health support\s*goes both ways/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Get Started/i })).toHaveAttribute("href", "/signup");
    expect(
      screen.getByRole("link", { name: /Already part of Jeevan Verse\? Sign in/i }),
    ).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Talk to Umeed" })).toHaveAttribute("href", "/chatbot");
    expect(screen.getByRole("link", { name: "Explore blood requests" })).toHaveAttribute(
      "href",
      "/bloodbridge",
    );
    expect(screen.getByRole("link", { name: "Find your conversation" })).toHaveAttribute(
      "href",
      "/discussions",
    );
    expect(screen.getByRole("link", { name: "Bring your organization" })).toHaveAttribute(
      "href",
      "/organisation",
    );
    expect(screen.getByText(/Information and support. Not a diagnosis/)).toBeInTheDocument();
  });
});

describe("BloodBridge page", () => {
  it("hides and restores desktop filters and closes mobile filters", async () => {
    render(
      <MemoryRouter initialEntries={["/bloodbridge?status=all"]}>
        <BloodBridge />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Hide filters" }));
    expect(screen.getAllByRole("button", { name: "Filters" })).toHaveLength(2);
    await userEvent.click(screen.getAllByRole("button", { name: "Filters" })[0]!);
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    await userEvent.click(screen.getByRole("button", { name: "Show requests" }));
    await userEvent.click(screen.getByRole("tab", { name: "My requests" }));
    await userEvent.click(screen.getByRole("tab", { name: "Browse requests" }));
    expect(screen.getByText("Active request list")).toBeInTheDocument();
  });
  it("starts on donor actions and switches to the user's requests", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <BloodBridge />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Blood requests" })).toBeInTheDocument();
    expect(screen.getByText("Request creation form")).toBeInTheDocument();
    expect(screen.getByText("Active request list")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Blood Donation Guidelines/i })).toHaveAttribute(
      "href",
      "/bloodbridge/guidelines",
    );

    await user.click(screen.getByRole("tab", { name: "My requests" }));
    expect(screen.getByText("My request list")).toBeInTheDocument();
    expect(screen.getByText("Request creation form")).toBeInTheDocument();
  });
});

describe("blood donation guidelines", () => {
  it("presents preparation, screening and aftercare with primary references", () => {
    render(
      <MemoryRouter>
        <BloodDonationGuidelines />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Blood donation guidelines" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Before you donate" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "At the blood centre" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "After donation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "WHO: who can give blood" })).toHaveAttribute(
      "href",
      "https://www.who.int/campaigns/world-blood-donor-day/who-can-give-blood",
    );
    expect(
      screen.queryByText("Wait at least 56 days before next donation"),
    ).not.toBeInTheDocument();
  });
});
