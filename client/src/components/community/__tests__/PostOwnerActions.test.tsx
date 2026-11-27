// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PostOwnerActions from "../PostOwnerActions";
import type { CommunityFeedItem } from "../community-feed-types";

const mocks = vi.hoisted(() => ({ remove: vi.fn(), userId: "owner" as string | null }));
vi.mock("@/api/api", () => ({ api: { delete: mocks.remove } }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { user: mocks.userId ? { id: mocks.userId } : null } }),
}));
vi.mock("@/components/discussion/CreatePost", () => ({
  default: () => <button>Edit post</button>,
}));
const item: CommunityFeedItem = {
  id: "example",
  type: "discussion",
  title: "Synthetic post",
  excerpt: "Content",
  tags: [],
  thumbnail: "",
  createdAt: "2026-11-27T10:00:00Z",
  author: { id: "owner", name: "Example author" },
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.userId = "owner";
  mocks.remove.mockResolvedValue({});
});

describe("post actions in the conversation modal", () => {
  it("requires confirmation before deleting and notifies the feed", async () => {
    const onDeleted = vi.fn();
    render(
      <PostOwnerActions
        item={item}
        content="Full content"
        onUpdated={vi.fn()}
        onDeleted={onDeleted}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete post" }));
    expect(mocks.remove).not.toHaveBeenCalled();
    const dialog = screen.getByRole("alertdialog", { name: "Delete this post?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete post" }));
    expect(mocks.remove).toHaveBeenCalledWith("/posts/delete/example");
    expect(onDeleted).toHaveBeenCalledOnce();
  });
  it.each([null, "other"])("hides author actions from %s", (userId) => {
    mocks.userId = userId;
    render(
      <PostOwnerActions
        item={item}
        content="Full content"
        onUpdated={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it("keeps the confirmation open and permits retry after an error", async () => {
    mocks.remove.mockRejectedValueOnce(new Error("Offline"));
    const onDeleted = vi.fn();
    render(
      <PostOwnerActions
        item={item}
        content="Full content"
        onUpdated={vi.fn()}
        onDeleted={onDeleted}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete post" }));
    const dialog = screen.getByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete post" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not delete the post");
    expect(onDeleted).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete post" }));
    expect(onDeleted).toHaveBeenCalledOnce();
  });
});
