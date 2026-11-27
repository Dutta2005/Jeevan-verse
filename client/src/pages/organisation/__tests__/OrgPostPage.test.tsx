// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrgPostPage from "../OrgPostPage";

const mocks = vi.hoisted(() => ({ get: vi.fn(), role: "user" }));
vi.mock("../../../api/api", () => ({ api: { get: mocks.get } }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) => select({ auth: { role: mocks.role } }),
}));
const post = {
  _id: "post-1",
  title: "Test campaign",
  content: "x".repeat(60),
  tags: "awareness",
  thumbnail: "https://example.test/image.png",
  organization: { _id: "org-1", name: "Test organization" },
  createdAt: "2026-01-01T00:00:00Z",
};
const response = (page: number, posts = [post]) => ({
  status: 200,
  data: { data: { posts, pagination: { currentPage: page, totalPages: 2 } } },
});
beforeEach(() => {
  vi.resetAllMocks();
  mocks.role = "user";
});
afterEach(() => vi.restoreAllMocks());
const mount = () =>
  render(
    <MemoryRouter>
      <OrgPostPage />
    </MemoryRouter>,
  );

describe("organization posts listing", () => {
  it("renders content previews and paginates both ways", async () => {
    mocks.get.mockImplementation((url: string) =>
      Promise.resolve(response(url.endsWith("2") ? 2 : 1)),
    );
    mount();
    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText(`${"x".repeat(50)}...`)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Test campaign/ })).toHaveAttribute(
      "href",
      "/post/post-1",
    );
    expect(screen.getByAltText("Test campaign")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument();
  });
  it("uses organization routes for organization accounts and supports missing optional content", async () => {
    mocks.role = "organization";
    mocks.get.mockResolvedValue(
      response(1, [{ ...post, content: "Short content", tags: "", thumbnail: "" }]),
    );
    mount();
    expect(await screen.findByText("Short content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Test campaign/ })).toHaveAttribute(
      "href",
      "/organisation/post/post-1",
    );
    expect(screen.getByRole("link", { name: "Test organization" })).toHaveAttribute(
      "href",
      "/organisation/org-profile/org-1",
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
  it("shows skeletons during loading", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    expect(mount().container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
  it.each(["empty", "unexpected", "error"])(
    "hides pagination after an %s response",
    async (result) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      if (result === "error") mocks.get.mockRejectedValue(new Error("Offline"));
      else mocks.get.mockResolvedValue(result === "empty" ? response(1, []) : { status: 204 });
      const { container } = mount();
      await waitFor(() =>
        expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument(),
      );
      expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    },
  );
});
