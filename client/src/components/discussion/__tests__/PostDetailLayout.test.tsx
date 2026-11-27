// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import PostDetailLayout from "../PostDetailLayout";

describe("post reading layout", () => {
  it.each([
    ["/discussions?type=organization", "/discussions?type=organization"],
    ["https://example.test", "/discussions"],
    ["/unrelated", "/discussions"],
  ])("keeps a safe Community return destination: %s", (communityFrom, expected) => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/post/example", state: { communityFrom } }]}>
        <PostDetailLayout
          title="A community question"
          author={<span>Example author</span>}
          authorName="Example author"
          createdAt="2026-11-27T10:00:00Z"
          tags={["question"]}
          comments={<p>Comments here</p>}
        >
          <p>Post content</p>
        </PostDetailLayout>
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Back to Community" })).toHaveAttribute(
      "href",
      expected,
    );
    expect(screen.getByRole("heading", { name: "A community question" })).toBeInTheDocument();
    expect(screen.getByText("Post content")).toBeInTheDocument();
    expect(screen.getByText("Comments here")).toBeInTheDocument();
  });
});
