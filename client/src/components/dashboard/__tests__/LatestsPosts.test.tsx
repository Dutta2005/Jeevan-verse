// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LatestsPosts } from "../LatestsPosts";

const get = vi.hoisted(() => vi.fn());
vi.mock("../../../api/api", () => ({ api: { get } }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { user: { id: "user-1" } } }),
}));
beforeEach(() => {
  get.mockReset();
});
const mount = () =>
  render(
    <MemoryRouter>
      <LatestsPosts />
    </MemoryRouter>,
  );

describe("latest user posts", () => {
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
    expect(await screen.findByText("No Posts Yet")).toBeInTheDocument();
  });
  it("reports request failures", async () => {
    get.mockRejectedValue(new Error("Offline"));
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
  });
});
