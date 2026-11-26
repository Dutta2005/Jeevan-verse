// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DiscussionPost from "../DiscussionPost";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  delete: vi.fn(),
  toast: vi.fn(),
  navigate: vi.fn(),
  userId: "u1",
  postId: "p1" as string | undefined,
}));
vi.mock("../../../api/api", () => ({ api: { get: mocks.get, delete: mocks.delete } }));
vi.mock("../../../hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { user: { id: mocks.userId } } }),
}));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useParams: () => ({ id: mocks.postId }),
  useNavigate: () => mocks.navigate,
}));
vi.mock("../../CommentSection", () => ({
  default: ({ postId }: { postId: string }) => <p>Comments for {postId}</p>,
}));
vi.mock("../CreatePost", () => ({ default: () => <button>Edit discussion</button> }));
const post = {
  _id: "p1",
  title: "Synthetic title",
  content: "Synthetic content",
  author: { _id: "u1", name: "Test author" },
  tags: ["help"],
  createdAt: "2026-01-01T00:00:00Z",
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.userId = "u1";
  mocks.postId = "p1";
  mocks.get.mockResolvedValue({ data: { data: post } });
});
const mount = () =>
  render(
    <MemoryRouter>
      <DiscussionPost />
    </MemoryRouter>,
  );

describe("discussion detail", () => {
  it("shows the author's post, tags and comments, and exposes edit/delete actions", async () => {
    mount();
    await screen.findByText("Synthetic title");
    expect(mocks.get).toHaveBeenCalledWith("/posts/p1");
    expect(screen.getByText("Test author")).toBeInTheDocument();
    expect(screen.getByText("Comments for p1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "" }));
    expect(await screen.findByRole("button", { name: "Edit discussion" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
  it("does not show the author's actions to other users", async () => {
    mocks.userId = "other";
    mount();
    await screen.findByText("Synthetic title");
    expect(screen.queryByRole("button", { name: "" })).not.toBeInTheDocument();
  });
  it.each([true, false])("handles post deletion (success: %s)", async (success) => {
    if (success) mocks.delete.mockResolvedValue({});
    else mocks.delete.mockRejectedValue(new Error("Offline"));
    mount();
    await screen.findByText("Synthetic title");
    await userEvent.click(screen.getByRole("button", { name: "" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(mocks.delete).toHaveBeenCalledWith("/posts/delete/p1");
    if (success) await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/discussions"));
    else expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
  });
  it.each(["error", "missing-id"])("explains a fetch failure: %s", async (result) => {
    if (result === "missing-id") mocks.postId = undefined;
    else mocks.get.mockRejectedValue(new Error("Offline"));
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      result === "missing-id" ? "No post ID provided" : "Offline",
    );
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" }));
  });
  it("handles an empty record", async () => {
    mocks.get.mockResolvedValue({ data: { data: null } });
    const { container } = mount();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
  it("shows a loading skeleton", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    expect(mount().container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
