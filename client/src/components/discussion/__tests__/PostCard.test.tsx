// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PostCard from "../PostCard";

const basePost = {
  _id: "post-1",
  title: "Sleep and health",
  content: "Share practical ways to improve sleep.",
  createdAt: "2026-11-20T10:00:00.000Z",
};

describe("PostCard", () => {
  it("renders the post title, content, author, date, tag and labelled comments action", () => {
    render(<PostCard post={{ ...basePost, author: { name: "Asha" }, tags: ["help"] }} />);

    expect(screen.getByRole("heading", { name: "Sleep and health" })).toBeInTheDocument();
    expect(screen.getByText("Share practical ways to improve sleep.")).toBeInTheDocument();
    expect(screen.getByText("Asha")).toBeInTheDocument();
    expect(screen.getByText("November 20, 2026")).toBeInTheDocument();
    expect(screen.getByText("help")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comments" })).toBeInTheDocument();
  });

  it("handles a missing author and tags", () => {
    render(<PostCard post={basePost} />);

    expect(screen.getByRole("heading", { name: "Sleep and health" })).toBeInTheDocument();
    expect(screen.queryByText("November 20, 2026")).toBeInTheDocument();
    expect(screen.queryByText("Asha")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Comments" })).toBeInTheDocument();
  });
});
