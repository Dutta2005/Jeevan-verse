// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreatePost from "../CreatePost";
import { selectOption } from "../../../test/selectOption";

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  patch: vi.fn(),
  navigate: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("../../../api/api", () => ({ api: { post: mocks.post, patch: mocks.patch } }));
vi.mock("react-router", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("../../../hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
const post = {
  _id: "p1",
  title: "Original title",
  content: "Original content",
  tags: ["help"],
  author: { _id: "u1", name: "Test author" },
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.post.mockResolvedValue({});
  mocks.patch.mockResolvedValue({});
});
afterEach(() => vi.restoreAllMocks());

describe("discussion post form", () => {
  it("updates a modal post through its callback without navigating to details", async () => {
    const onUpdated = vi.fn();
    render(<CreatePost post={post} currentUserId="u1" onUpdated={onUpdated} />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Post" }));
    fireEvent.change(screen.getByPlaceholderText("Title"), { target: { value: "Updated title" } });
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() =>
      expect(onUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ _id: "p1", title: "Updated title", content: "Original content" }),
      ),
    );
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
  it.each([false, true])("creates a discussion (anonymous: %s)", async (anonymous) => {
    render(<CreatePost />);
    await userEvent.click(screen.getByRole("button", { name: "Create Post" }));
    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Synthetic title" },
    });
    fireEvent.change(screen.getByPlaceholderText("What's on your mind?"), {
      target: { value: "Synthetic content" },
    });
    await selectOption(0, "Help");
    if (anonymous) await userEvent.click(screen.getByRole("switch", { name: "Post Anonymously" }));
    await userEvent.click(screen.getByRole("button", { name: "Post" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/discussions"));
    expect(mocks.post).toHaveBeenCalledWith("/posts/create", {
      title: "Synthetic title",
      content: "Synthetic content",
      tags: ["help"],
      isAnonymous: anonymous,
    });
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Success!" }));
  });
  it("updates an author's existing discussion and resets when a new source post is supplied", async () => {
    const { rerender } = render(<CreatePost post={post} currentUserId="u1" />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Post" }));
    expect(screen.getByPlaceholderText("Title")).toHaveValue("Original title");
    rerender(
      <CreatePost post={{ ...post, _id: "p2", title: "Changed source" }} currentUserId="u1" />,
    );
    expect(screen.getByPlaceholderText("Title")).toHaveValue("Changed source");
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/discussions/p2"));
    expect(mocks.patch).toHaveBeenCalledWith(
      "/posts/edit/p2",
      expect.objectContaining({ title: "Changed source" }),
    );
  });
  it("hides editing from a different user", () => {
    const { container } = render(<CreatePost post={post} currentUserId="other" />);
    expect(container).toBeEmptyDOMElement();
  });
  it.each([true, false])("keeps input and explains failures (editing: %s)", async (editing) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.post.mockRejectedValue(new Error("Offline"));
    mocks.patch.mockRejectedValue(new Error("Offline"));
    render(
      <CreatePost
        post={editing ? post : undefined}
        currentUserId="u1"
        trigger={<button>Open form</button>}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open form" }));
    if (!editing) {
      fireEvent.change(screen.getByPlaceholderText("Title"), {
        target: { value: "Synthetic title" },
      });
      fireEvent.change(screen.getByPlaceholderText("What's on your mind?"), {
        target: { value: "Synthetic content" },
      });
      await selectOption(0, "General");
    }
    await userEvent.click(screen.getByRole("button", { name: editing ? "Save Changes" : "Post" }));
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          description: `Failed to ${editing ? "update" : "create"} post. Please try again.`,
        }),
      ),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
