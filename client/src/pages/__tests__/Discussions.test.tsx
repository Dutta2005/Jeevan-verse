// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Discussions from "../Discussions";

const get = vi.hoisted(() => vi.fn());
vi.mock("../../api/api", () => ({ api: { get } }));
vi.mock("../../components/discussion/CreatePost", () => ({
  default: () => <button>Create post</button>,
}));

const item = (id: string, type = "discussion") => ({
  id,
  type,
  title: `Post ${id}`,
  excerpt: "Synthetic content",
  tags: [],
  thumbnail: "",
  createdAt: "2026-11-27T10:00:00.000Z",
  author: { id: "author", name: "Synthetic author" },
});
const response = (
  items = [item("one"), item("two", "organization")],
  nextCursor: string | null = null,
) => ({ data: { data: { items, nextCursor, hasMore: nextCursor !== null } } });
const mount = (url = "/discussions") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Discussions />
    </MemoryRouter>,
  );
beforeEach(() => {
  get.mockReset();
  get.mockResolvedValue(response());
});

describe("unified Community feed", () => {
  it.each([
    ["/discussions", "No posts yet"],
    ["/discussions?type=organization", "No organization updates yet"],
  ])("explains an empty feed at %s", async (url, title) => {
    get.mockResolvedValue(response([]));
    mount(url);
    expect(await screen.findByText(title)).toBeInTheDocument();
    if (url.includes("organization")) {
      expect(
        screen.getByText("Organization updates will appear here when published."),
      ).toBeInTheDocument();
    }
  });
  it("shows both post types directly in cards without detail-page links", async () => {
    mount();
    expect(await screen.findByRole("heading", { name: "Post one" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Post two" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open post/ })).not.toBeInTheDocument();
    expect(screen.getByText("Organization")).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith(
      "/community/feed?type=all",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
  it("appends the next cursor page without replacing earlier posts", async () => {
    get
      .mockResolvedValueOnce(response([item("one")], "next"))
      .mockResolvedValueOnce(response([item("two")]));
    mount();
    await userEvent.click(await screen.findByRole("button", { name: "Load more" }));
    expect(await screen.findByText("Post two")).toBeInTheDocument();
    expect(screen.getByText("Post one")).toBeInTheDocument();
    expect(get).toHaveBeenLastCalledWith("/community/feed?type=all&cursor=next", expect.anything());
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });
  it("changes source filters and resets the list", async () => {
    get
      .mockResolvedValueOnce(response([item("one")]))
      .mockResolvedValueOnce(response([item("two", "organization")]));
    mount();
    await screen.findByText("Post one");
    await userEvent.click(screen.getByRole("tab", { name: "Organizations" }));
    expect(await screen.findByText("Post two")).toBeInTheDocument();
    expect(screen.queryByText("Post one")).not.toBeInTheDocument();
    expect(get).toHaveBeenLastCalledWith("/community/feed?type=organization", expect.anything());
  });
  it("keeps already loaded posts after a pagination failure and retries", async () => {
    get
      .mockResolvedValueOnce(response([item("one")], "next"))
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce(response([item("two")]));
    mount();
    await userEvent.click(await screen.findByRole("button", { name: "Load more" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Post one")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Post two")).toBeInTheDocument();
  });
  it("displays an empty state for a source without posts", async () => {
    get.mockResolvedValue(response([]));
    mount("/discussions?type=discussion");
    expect(await screen.findByText("No discussions yet")).toBeInTheDocument();
  });
  it("ignores responses from a previous source after switching", async () => {
    let resolveOld!: (value: ReturnType<typeof response>) => void;
    get
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
      )
      .mockResolvedValueOnce(response([item("two", "organization")]));
    mount();
    await userEvent.click(screen.getByRole("tab", { name: "Organizations" }));
    await screen.findByText("Post two");
    await act(async () => {
      resolveOld(response([item("one")]));
    });
    expect(screen.queryByText("Post one")).not.toBeInTheDocument();
  });
});
