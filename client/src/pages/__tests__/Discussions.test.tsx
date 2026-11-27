// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Discussions from "../Discussions";

const get = vi.hoisted(() => vi.fn());
vi.mock("../../api/api", () => ({ api: { get } }));
vi.mock("../../components/discussion/CreatePost", () => ({
  default: () => <button>Create Post</button>,
}));
beforeEach(() => {
  get.mockReset();
});
afterEach(() => vi.restoreAllMocks());
const response = (page: number) => ({
  data: {
    data: {
      posts: [
        {
          _id: `post-${page}`,
          title: `Page ${page} post`,
          content: "Synthetic post",
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      pagination: { currentPage: page, totalPages: 2, totalPosts: 2, postsPerPage: 1 },
    },
  },
});
const mount = () =>
  render(
    <MemoryRouter>
      <Discussions />
    </MemoryRouter>,
  );

describe("discussion listing", () => {
  it("shows placeholders while loading", () => {
    get.mockReturnValue(new Promise(() => {}));
    expect(mount().container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
  it("loads posts and paginates forward and back", async () => {
    get.mockImplementation((url: string) => Promise.resolve(response(url.endsWith("2") ? 2 : 1)));
    mount();
    expect(await screen.findByRole("link", { name: /Page 1 post/ })).toHaveAttribute(
      "href",
      "/discussions/post-1",
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("/posts?page=2");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument();
  });
  it("exits the loading state after a failed request", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    get.mockRejectedValue(new Error("Offline"));
    mount();
    expect(await screen.findByRole("button", { name: "Create Post" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
