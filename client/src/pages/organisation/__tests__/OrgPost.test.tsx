// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrgPost from "../OrgPost";

const mocks = vi.hoisted(() => ({ get: vi.fn(), role: "user" }));
vi.mock("../../../api/api", () => ({ api: { get: mocks.get } }));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useParams: () => ({ id: "post-1" }),
}));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) => select({ auth: { role: mocks.role } }),
}));
vi.mock("../../../components/CommentSection", () => ({
  default: ({ postId }: { postId: string }) => <p>Comments for {postId}</p>,
}));
const post = {
  _id: "post-1",
  title: "Test campaign",
  content: "Campaign content",
  tags: "awareness",
  thumbnail: "https://example.test/image.png",
  organization: { _id: "org-1", name: "Test organization" },
  createdAt: "2026-01-01T00:00:00Z",
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.role = "user";
});
const mount = () =>
  render(
    <MemoryRouter>
      <OrgPost />
    </MemoryRouter>,
  );

describe("organization post", () => {
  it.each(["user", "organization"])("renders the post and profile link for a %s", async (role) => {
    mocks.role = role;
    mocks.get.mockResolvedValue({
      data: {
        data: {
          ...post,
          tags: role === "user" ? "awareness" : "",
          thumbnail: role === "user" ? post.thumbnail : "",
        },
      },
    });
    mount();
    expect(await screen.findByRole("heading", { name: "Test campaign" })).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith("/org-posts/post-1");
    expect(screen.getByRole("link", { name: "Test organization" })).toHaveAttribute(
      "href",
      role === "user" ? "/org-profile/org-1" : "/organisation/org-profile/org-1",
    );
    expect(screen.getByText("Comments for post-1")).toBeInTheDocument();
    expect(screen.queryByAltText("Test campaign") !== null).toBe(role === "user");
  });
  it("shows a skeleton while fetching", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    expect(mount().container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
  it("shows a not-found message for a missing post", async () => {
    mocks.get.mockResolvedValue({ data: { data: null } });
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The requested post could not be found",
    );
  });
  it("shows the request error", async () => {
    mocks.get.mockRejectedValue(new Error("Offline"));
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
  });
});
