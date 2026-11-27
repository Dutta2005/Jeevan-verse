// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import PostOwnerActions from "../PostOwnerActions";
import type { CommunityFeedItem } from "../community-feed-types";

vi.mock("@/api/api", () => ({ api: { patch: vi.fn(), delete: vi.fn() } }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) => select({ auth: { user: { id: "owner" } } }),
}));
const item: CommunityFeedItem = {
  id: "example",
  type: "discussion",
  title: "Saved title",
  excerpt: "Content",
  tags: ["help"],
  thumbnail: "",
  createdAt: "2026-11-27T10:00:00Z",
  author: { id: "owner", name: "Example author" },
};

describe("editing in a live feed", () => {
  it("preserves the draft when the parent rerenders after pagination", async () => {
    const tree = () => (
      <MemoryRouter>
        <PostOwnerActions
          item={item}
          content="Saved content"
          onUpdated={vi.fn()}
          onDeleted={vi.fn()}
        />
      </MemoryRouter>
    );
    const view = render(tree());
    await userEvent.click(screen.getByRole("button", { name: "Edit post" }));
    fireEvent.change(screen.getByPlaceholderText("Title"), { target: { value: "Unsaved title" } });
    view.rerender(tree());
    expect(screen.getByPlaceholderText("Title")).toHaveValue("Unsaved title");
  });
});
