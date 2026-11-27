// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Discussions from "@/pages/Discussions";
import FeedPostCard from "../FeedPostCard";
import type { CommunityFeedItem } from "../community-feed-types";

const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("@/api/api", () => ({ api }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) => select({ auth: { user: { id: "owner" } } }),
}));
vi.mock("@/components/CommentSection", () => ({ default: () => <p>Conversation</p> }));
const item: CommunityFeedItem = {
  id: "owned",
  type: "discussion",
  title: "Owned discussion",
  excerpt: "Short excerpt",
  tags: ["help"],
  thumbnail: "",
  createdAt: "2026-11-27T10:00:00Z",
  author: { id: "owner", name: "Synthetic author" },
};
beforeEach(() => {
  vi.clearAllMocks();
  api.patch.mockResolvedValue({});
  api.delete.mockResolvedValue({});
  api.get.mockImplementation((url: string) =>
    Promise.resolve({
      data: {
        data: url.startsWith("/community/feed")
          ? { items: [item, { ...item, type: "organization" }], hasMore: false, nextCursor: null }
          : { content: "Full original content" },
      },
    }),
  );
});

describe("feed owner flows", () => {
  it.each([false, true])("updates a card after editing (anonymous: %s)", async (anonymous) => {
    render(
      <MemoryRouter>
        <FeedPostCard item={item} />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button", { name: item.title }));
    await userEvent.click(await screen.findByRole("button", { name: "Edit post" }));
    fireEvent.change(screen.getByPlaceholderText("Title"), { target: { value: "Revised title" } });
    fireEvent.change(screen.getByPlaceholderText("What's on your mind?"), {
      target: { value: "Revised content" },
    });
    if (anonymous) await userEvent.click(screen.getByRole("switch", { name: "Post Anonymously" }));
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(
        "/posts/edit/owned",
        expect.objectContaining({ title: "Revised title", isAnonymous: anonymous }),
      ),
    );
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Revised title" })).toBeInTheDocument();
    expect(screen.getByText("Revised content")).toBeInTheDocument();
    expect(screen.getByText(anonymous ? "Anonymous" : "Synthetic author")).toBeInTheDocument();
  });

  it("removes only the deleted source when post ids collide and restores feed focus", async () => {
    render(
      <MemoryRouter>
        <Discussions />
      </MemoryRouter>,
    );
    await screen.findAllByRole("button", { name: item.title });
    await userEvent.click(screen.getAllByRole("button", { name: item.title })[0]);
    await userEvent.click(await screen.findByRole("button", { name: "Delete post" }));
    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Delete post" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getAllByRole("button", { name: item.title })).toHaveLength(1);
    expect(screen.getByText("Organization")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("region", { name: "Community posts" })).toHaveFocus(),
    );
  });

  it("removes a standalone card after confirmation", async () => {
    const { container } = render(
      <MemoryRouter>
        <FeedPostCard item={item} />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button", { name: item.title }));
    await userEvent.click(await screen.findByRole("button", { name: "Delete post" }));
    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Delete post" }),
    );
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
