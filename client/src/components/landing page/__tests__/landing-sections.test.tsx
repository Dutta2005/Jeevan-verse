// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Campaign from "../Campaign";
import ChitChat from "../ChitChat";
import BloodBridge from "../BloodBridge";
import Umeed from "../Umeed";

describe("landing page sections", () => {
  it("renders the legacy feature previews", () => {
    render(
      <>
        <BloodBridge />
        <Umeed />
      </>,
    );
    expect(screen.getByRole("heading", { name: "BloodBridge" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Umeed" })).toBeInTheDocument();
    expect(screen.getByText("Quick Response")).toBeInTheDocument();
    expect(screen.getByText("Donations Made")).toBeInTheDocument();
  });
  it("shows campaign details and schedules", () => {
    render(<Campaign />);

    expect(
      screen.getByRole("heading", { name: "Join Our Latest Initiatives" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Emergency Blood Drive")).toBeInTheDocument();
    expect(screen.getByText("February 15, 2025")).toBeInTheDocument();
    expect(screen.getByText("Community Center")).toBeInTheDocument();
  });

  it("renders both community discussion carousels", () => {
    render(<ChitChat />);

    expect(screen.getByRole("heading", { name: "Chit Chat" })).toBeInTheDocument();
    expect(screen.getAllByText("Need help with fever symptoms").length).toBeGreaterThan(1);
    expect(screen.getAllByText("How to reduce sugar cravings?").length).toBeGreaterThan(1);
    expect(screen.getByText(/Replies from doctors and medical students/)).toBeInTheDocument();
  });
});
