// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LatestsPosts } from "../LatestsPosts";

const get = vi.hoisted(() => vi.fn());
const account = vi.hoisted(() => ({ id: "user-1" as string | undefined }));
vi.mock("../../../api/api", () => ({ api: { get } }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { user: { id: account.id } } }),
}));
beforeEach(() => {
  get.mockReset();
  account.id = "user-1";
});
const mount = () =>
  render(
    <MemoryRouter>
      <LatestsPosts />
    </MemoryRouter>,
  );

describe("latest user posts", () => {
  it("does not fetch without a user and handles an empty payload", async () => {
    account.id = undefined;
    const view = mount();
    expect(get).not.toHaveBeenCalled();
    account.id = "user-1";
    get.mockResolvedValue({ data: {} });
    view.rerender(
      <MemoryRouter>
        <LatestsPosts />
      </MemoryRouter>,
    );
    expect(await screen.findByText("No posts yet")).toBeInTheDocument();
  });
  it.each(["resolve", "reject"])(
    "ignores a late posts response after unmount (%s)",
    async (outcome) => {
      let finish!: (value: unknown) => void;
      let fail!: (reason: unknown) => void;
      get.mockReturnValue(
        new Promise((resolve, reject) => {
          finish = resolve;
          fail = reject;
        }),
      );
      const view = mount();
      view.unmount();
      await act(async () => {
        if (outcome === "resolve") finish({ data: { data: [] } });
        else fail(new Error("Offline"));
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );
  it("hides the previous account's posts while loading another account", async () => {
    get.mockResolvedValueOnce({
      data: {
        data: [{ _id: "old", title: "Previous account post", content: "Private", createdAt: "" }],
      },
    });
    const view = mount();
    await screen.findByText("Previous account post");
    account.id = "user-2";
    get.mockReturnValue(new Promise(() => {}));
    view.rerender(
      <MemoryRouter>
        <LatestsPosts />
      </MemoryRouter>,
    );
    expect(screen.queryByText("Previous account post")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Loading posts")).toBeInTheDocument();
    expect(get).toHaveBeenLastCalledWith("/posts/user/user-2");
  });
  it("shows placeholders during the request", () => {
    get.mockReturnValue(new Promise(() => {}));
    const { container } = mount();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
  it("links the user's posts to their discussion detail", async () => {
    get.mockResolvedValue({
      data: {
        data: [
          {
            _id: "post-1",
            title: "Test post",
            content: "Test content",
            createdAt: "2026-01-01T00:00:00Z",
            tags: ["Community"],
          },
        ],
      },
    });
    mount();
    expect(await screen.findByRole("link", { name: /Test post/ })).toHaveAttribute(
      "href",
      "/discussions/post-1",
    );
    expect(get).toHaveBeenCalledWith("/posts/user/user-1");
  });
  it("explains an empty post list", async () => {
    get.mockResolvedValue({ data: { data: [] } });
    mount();
    expect(await screen.findByText("No posts yet")).toBeInTheDocument();
  });
  it("reports request failures", async () => {
    get.mockRejectedValue(new Error("Offline"));
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
  });
});
