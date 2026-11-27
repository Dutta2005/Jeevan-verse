// @vitest-environment jsdom
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FeedPostCard from "../FeedPostCard";
import type { CommunityFeedItem } from "../community-feed-types";

const get = vi.hoisted(() => vi.fn());
const commentUpdates = vi.hoisted(() => ({
  notify: undefined as ((count: number) => void) | undefined,
}));
vi.mock("@/api/api", () => ({ api: { get } }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) => select({ auth: { user: null } }),
}));
vi.mock("@/components/CommentSection", () => ({
  default: ({
    postId,
    onCountChange,
  }: {
    postId: string;
    onCountChange?: (count: number) => void;
  }) => {
    commentUpdates.notify = onCountChange;
    return <p>Comments for {postId}</p>;
  },
}));
const item: CommunityFeedItem = {
  id: "example",
  type: "discussion",
  title: "A community question",
  excerpt: "Short post",
  tags: ["question"],
  thumbnail: "",
  createdAt: "2026-11-27T10:00:00Z",
  author: { id: null, name: "Anonymous" },
};
const mount = (post = item) =>
  render(
    <MemoryRouter initialEntries={["/discussions?type=discussion"]}>
      <FeedPostCard item={post} />
    </MemoryRouter>,
  );
beforeEach(() => {
  get.mockReset();
  commentUpdates.notify = undefined;
  get.mockResolvedValue({ data: { data: { content: "Full post content" } } });
});

describe("Community post card", () => {
  it("rejects malformed detail responses and recovers on retry", async () => {
    get.mockResolvedValueOnce({ data: { data: {} } });
    mount();
    await userEvent.click(screen.getByRole("button", { name: /Comments/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load the full post");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Full post content")).toBeInTheDocument();
  });
  it.each([
    [0, "0 comments"],
    [1, "1 comment"],
    [4, "4 comments"],
  ] as const)("shows the full discussion count %s", (commentCount, label) => {
    mount({ ...item, commentCount });
    expect(screen.getByText(label)).toBeInTheDocument();
  });
  it("updates its count from the open conversation", async () => {
    mount({ ...item, commentCount: 2 });
    await userEvent.click(screen.getByRole("button", { name: item.title }));
    await act(async () => {
      commentUpdates.notify?.(5);
    });
    await userEvent.keyboard("{Escape}");
    expect(screen.getByText("5 comments")).toBeInTheDocument();
  });
  it("opens the card with the keyboard and returns focus to that opener", async () => {
    mount();
    const opener = screen.getByRole("button", { name: item.title });
    opener.focus();
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByRole("dialog", { name: item.title })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(opener).toHaveFocus();
  });
  it("keeps organization profile links independent of the card opener", async () => {
    mount({ ...item, type: "organization", author: { id: "org", name: "Example organization" } });
    await userEvent.click(screen.getByRole("link", { name: "Example organization" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
  });
  it("ignores a late response after closing and loads correctly when reopened", async () => {
    let resolveOld!: (value: unknown) => void;
    get.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
    );
    mount();
    const trigger = screen.getByRole("button", { name: /Comments/ });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await act(async () => {
      resolveOld({ data: { data: { content: "Old response" } } });
    });
    await userEvent.click(trigger);
    expect(await screen.findByText("Full post content")).toBeInTheDocument();
    expect(screen.queryByText("Old response")).not.toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(2);
  });
  it("shows short posts directly without fetching details or comments", () => {
    mount();
    expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument();
    expect(screen.getByText(item.excerpt)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: item.title })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Read more" })).not.toBeInTheDocument();
    expect(screen.queryByText("Comments for example")).not.toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
  });
  it("expands and caches full text without navigation", async () => {
    mount({ ...item, excerpt: "A".repeat(280) });
    await userEvent.click(screen.getByRole("button", { name: "Read more" }));
    expect(await screen.findByText("Full post content")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(get).toHaveBeenCalledWith(
      "/posts/example",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Show less" }));
    await userEvent.click(screen.getByRole("button", { name: "Read more" }));
    expect(screen.getByText("Full post content")).toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(1);
  });
  it("opens comments in a dialog and returns focus when closed", async () => {
    mount();
    const trigger = screen.getByRole("button", { name: /Comments/ });
    await userEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: item.title });
    expect(await within(dialog).findByText("Full post content")).toBeInTheDocument();
    expect(within(dialog).getByText("Comments for example")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("keeps errors local and lets the reader retry", async () => {
    get.mockRejectedValueOnce(new Error("Offline"));
    mount({ ...item, type: "organization", excerpt: "A".repeat(280) });
    await userEvent.click(screen.getByRole("button", { name: "Read more" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Full post content")).toBeInTheDocument();
    expect(get).toHaveBeenLastCalledWith("/org-posts/example", expect.anything());
  });
});
