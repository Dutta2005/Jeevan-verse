// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authReducer, { login, loginOrganization } from "../../store/authSlice";
import CommentSection from "../CommentSection";

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("../../api/api", () => ({ api: apiMocks }));

const comments = [
  {
    _id: "comment-user",
    content: "Question by the doctor",
    user: { _id: "user-1", name: "Dr Asha", status: "doctor" },
    createdAt: "2026-11-20T10:00:00.000Z",
    replies: [
      {
        _id: "reply-org",
        content: "Reply from the clinic",
        organization: { _id: "org-1", name: "City Clinic" },
        createdAt: "2026-11-20T11:00:00.000Z",
      },
    ],
  },
  {
    _id: "comment-unknown",
    content: "Comment without an author",
    createdAt: "2026-11-19T10:00:00.000Z",
  },
  {
    _id: "comment-org",
    content: "Organization update",
    organization: { _id: "org-1", name: "City Clinic" },
    createdAt: "2026-11-18T10:00:00.000Z",
  },
];

function renderComments(account: "guest" | "user" | "organization") {
  const store = configureStore({ reducer: { auth: authReducer } });
  if (account === "user") {
    store.dispatch(login({ _id: "user-1", name: "Asha", info: { bloodGroup: "O+" } }));
  }
  if (account === "organization") {
    store.dispatch(loginOrganization({ _id: "org-1", name: "City Clinic" }));
  }

  return render(
    <Provider store={store}>
      <CommentSection postId="post-1" />
    </Provider>,
  );
}

describe("CommentSection", () => {
  beforeEach(() => {
    apiMocks.get.mockReset();
    apiMocks.post.mockReset();
    apiMocks.patch.mockReset();
    apiMocks.delete.mockReset();
  });

  it("shows the sign-in prompt and empty state to a visitor", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: { comments: [], totalPages: 1 } } });
    renderComments("guest");

    expect(screen.getByRole("heading", { name: "Authentication Required" })).toBeInTheDocument();
    expect(await screen.findByText("No comments yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Post Comment" })).not.toBeInTheDocument();
  });

  it("creates a top-level comment and clears the input after success", async () => {
    const user = userEvent.setup();
    apiMocks.get.mockResolvedValue({ data: { data: { comments: [], totalPages: 1 } } });
    apiMocks.post.mockResolvedValue({});
    renderComments("user");

    const input = await screen.findByPlaceholderText("Add a comment...");
    await user.type(input, "  Helpful response  ");
    await user.click(screen.getByRole("button", { name: "Post Comment" }));

    await waitFor(() =>
      expect(apiMocks.post).toHaveBeenCalledWith("/comments/post/post-1", {
        content: "  Helpful response  ",
      }),
    );
    expect(input).toHaveValue("");
    expect(apiMocks.get).toHaveBeenCalledTimes(2);
  });

  it("renders nested authors, supports reply/edit/delete, and paginates", async () => {
    const user = userEvent.setup();
    apiMocks.get.mockResolvedValue({ data: { data: { comments, totalPages: 2 } } });
    apiMocks.post.mockResolvedValue({});
    apiMocks.patch.mockResolvedValue({});
    apiMocks.delete.mockResolvedValue({});
    renderComments("user");

    expect(await screen.findByText("Question by the doctor")).toBeInTheDocument();
    expect(screen.getAllByText("City Clinic").length).toBeGreaterThan(0);
    expect(screen.getByText("Comment without an author")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    await user.click(screen.getAllByRole("button", { name: "Reply" })[0]);
    const replyInput = screen.getByPlaceholderText("Reply to comment...");
    await user.type(replyInput, "A nested reply");
    const replyForm = replyInput.closest("div.mt-2");
    expect(replyForm).not.toBeNull();
    await user.click(within(replyForm as HTMLElement).getByRole("button", { name: "Reply" }));
    await waitFor(() =>
      expect(apiMocks.post).toHaveBeenCalledWith("/comments/comment/comment-user", {
        content: "A nested reply",
      }),
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const editInput = screen.getByPlaceholderText("Edit your comment...");
    await user.clear(editInput);
    await user.type(editInput, "Updated doctor comment");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(apiMocks.patch).toHaveBeenCalledWith("/comments/comment-user", {
        content: "Updated doctor comment",
      }),
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(apiMocks.delete).toHaveBeenCalledWith("/comments/comment-user"));

    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() =>
      expect(apiMocks.get).toHaveBeenLastCalledWith("/comments/post/post-1", {
        params: { page: 2, limit: 10 },
      }),
    );
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await waitFor(() =>
      expect(apiMocks.get).toHaveBeenLastCalledWith("/comments/post/post-1", {
        params: { page: 1, limit: 10 },
      }),
    );
  });

  it("keeps a comment and explains when deletion fails", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: { comments, totalPages: 1 } } });
    apiMocks.delete.mockRejectedValue(new Error("Delete failed"));
    renderComments("user");
    await screen.findByText("Question by the doctor");
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("Delete failed")).toBeInTheDocument();
    expect(screen.getByText("Question by the doctor")).toBeInTheDocument();
    expect(apiMocks.get).toHaveBeenCalledTimes(1);
  });

  it("lets an organization edit its own comment and reports fetch and submit errors", async () => {
    const user = userEvent.setup();
    apiMocks.get.mockResolvedValueOnce({ data: { data: { comments, totalPages: 1 } } });
    apiMocks.patch.mockRejectedValue(new Error("Edit failed"));
    apiMocks.post.mockRejectedValue(new Error("Post failed"));
    renderComments("organization");

    expect(await screen.findByText("Organization update")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(2);
    await user.click(screen.getAllByRole("button", { name: "Edit" })[1]!);
    await user.type(screen.getByPlaceholderText("Edit your comment..."), "Try edit");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Edit failed")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Add a comment...");
    await user.type(input, "Try post");
    await user.click(screen.getByRole("button", { name: "Post Comment" }));
    expect(await screen.findByText("Post failed")).toBeInTheDocument();
  });

  it("shows the empty list and a readable error when loading fails", async () => {
    apiMocks.get.mockRejectedValue(new Error("Comments are unavailable"));
    renderComments("guest");

    expect(await screen.findByText("Comments are unavailable")).toBeInTheDocument();
    expect(screen.queryByText("No comments yet")).toBeInTheDocument();
  });
});
