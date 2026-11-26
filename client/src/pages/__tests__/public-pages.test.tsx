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
  default: () => <div>Active request list</div>,
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

    expect(screen.getByRole("heading", { name: /Jeevan Verse/i })).toBeInTheDocument();
    expect(screen.getByText(/Find symptoms, request blood, join discussions/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Get Started/i })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: /Sign In/i })).toHaveAttribute("href", "/login");
    expect(screen.getByText("AI-Powered Medical Assistant")).toBeInTheDocument();
    expect(screen.getByText("BloodBridge Network")).toBeInTheDocument();
    expect(screen.getByText("Chit Chat")).toBeInTheDocument();
    expect(screen.getByText("Join Our Latest Initiatives")).toBeInTheDocument();
    expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contact Us" })).toBeInTheDocument();
  });
});

describe("BloodBridge page", () => {
  it("starts on donor actions and switches to the user's requests", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <BloodBridge />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "BloodBridge" })).toBeInTheDocument();
    expect(screen.getByText("Request creation form")).toBeInTheDocument();
    expect(screen.getByText("Active request list")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Blood Donation Guidelines/i })).toHaveAttribute(
      "href",
      "/bloodbridge/guidelines",
    );

    await user.click(screen.getByRole("tab", { name: "Blood Requests" }));
    expect(screen.getByText("My request list")).toBeInTheDocument();
    expect(screen.queryByText("Request creation form")).not.toBeInTheDocument();
  });
});

describe("blood donation guidelines", () => {
  it("shows temporary and permanent deferral information and aftercare", () => {
    render(<BloodDonationGuidelines />);

    expect(screen.getByRole("heading", { name: "Blood Donation Guidelines" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Temporary Conditions" })).toBeInTheDocument();
    expect(screen.getByText("Recent surgery (within 6 months)")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Permanent Conditions" })).toBeInTheDocument();
    expect(screen.getByText(/Chronic illnesses like HIV/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "After Donation Care" })).toBeInTheDocument();
    expect(screen.getByText("Wait at least 56 days before next donation")).toBeInTheDocument();
  });
});
