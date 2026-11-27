// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, render, screen, waitFor, within } from "@testing-library/react";
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

function renderComments(
  account: "guest" | "user" | "organization",
  onCountChange?: (count: number) => void,
) {
  const store = configureStore({ reducer: { auth: authReducer } });
  if (account === "user") {
    store.dispatch(login({ _id: "user-1", name: "Asha", info: { bloodGroup: "O+" } }));
  }
  if (account === "organization") {
    store.dispatch(loginOrganization({ _id: "org-1", name: "City Clinic" }));
  }

  return render(
    <Provider store={store}>
      <CommentSection postId="post-1" onCountChange={onCountChange} />
    </Provider>,
  );
}

describe("CommentSection", () => {
  it("does not publish a stale discussion count after unmount", async () => {
    let resolveOld!: (response: unknown) => void;
    apiMocks.get.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
    );
    const onCountChange = vi.fn();
    const view = renderComments("guest", onCountChange);
    view.unmount();
    await act(async () => {
      resolveOld({ data: { data: { comments: [], totalPages: 1, totalDiscussionComments: 1 } } });
    });
    expect(onCountChange).not.toHaveBeenCalled();
  });
  it("keeps the newest total when an older read finishes after a comment submission", async () => {
    let resolveOld!: (response: unknown) => void;
    apiMocks.get.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
    );
    apiMocks.get.mockResolvedValueOnce({
      data: { data: { comments: [], totalPages: 1, totalDiscussionComments: 3 } },
    });
    apiMocks.post.mockResolvedValue({});
    const onCountChange = vi.fn();
    renderComments("user", onCountChange);
    await userEvent.type(screen.getByRole("textbox", { name: "Your comment" }), "A new comment");
    await userEvent.click(screen.getByRole("button", { name: "Post comment" }));
    await waitFor(() => expect(onCountChange).toHaveBeenLastCalledWith(3));
    await act(async () => {
      resolveOld({ data: { data: { comments: [], totalPages: 1, totalDiscussionComments: 1 } } });
    });
    expect(onCountChange).toHaveBeenLastCalledWith(3);
  });
  beforeEach(() => {
    apiMocks.get.mockReset();
    apiMocks.post.mockReset();
    apiMocks.patch.mockReset();
    apiMocks.delete.mockReset();
  });
  it("refreshes the card's full-thread total after submitting a reply", async () => {
    const onCountChange = vi.fn();
    apiMocks.get.mockResolvedValueOnce({
      data: {
        data: {
          comments: [comments[0]],
          totalPages: 1,
          totalComments: 1,
          totalDiscussionComments: 2,
        },
      },
    });
    apiMocks.get.mockResolvedValueOnce({
      data: {
        data: {
          comments: [comments[0]],
          totalPages: 1,
          totalComments: 1,
          totalDiscussionComments: 3,
        },
      },
    });
    apiMocks.post.mockResolvedValue({});
    renderComments("user", onCountChange);
    await waitFor(() => expect(onCountChange).toHaveBeenLastCalledWith(2));
    await userEvent.click(screen.getAllByRole("button", { name: "Reply" })[0]);
    await userEvent.type(screen.getByRole("textbox", { name: "Your reply" }), "New reply");
    await userEvent.click(
      within(screen.getByRole("group", { name: "Write a reply" })).getByRole("button", {
        name: "Reply",
      }),
    );
    await waitFor(() => expect(onCountChange).toHaveBeenLastCalledWith(3));
  });
  it("identifies and highlights self-reported doctor and medical-student comments and replies", async () => {
    const professionalComments = [
      {
        ...comments[0],
        replies: [
          {
            _id: "student-reply",
            content: "A student reply",
            user: { _id: "student", name: "Example student", status: "medical student" },
            createdAt: "2026-11-20T11:00:00Z",
          },
        ],
      },
    ];
    apiMocks.get.mockResolvedValue({
      data: { data: { comments: professionalComments, totalPages: 1 } },
    });
    renderComments("guest");
    expect(await screen.findByLabelText("Self-reported role: Doctor")).toBeInTheDocument();
    expect(screen.getByLabelText("Self-reported role: Medical student")).toBeInTheDocument();
    expect(screen.getByText("Question by the doctor").closest("[data-profession]")).toHaveAttribute(
      "data-profession",
      "doctor",
    );
    expect(screen.getByText("A student reply").closest("[data-profession]")).toHaveAttribute(
      "data-profession",
      "medical student",
    );
    expect(screen.queryByText(/verified/i)).not.toBeInTheDocument();
    const doctorHighlight = screen
      .getByLabelText("Self-reported role: Doctor")
      .closest("[data-profession]") as HTMLElement;
    expect(within(doctorHighlight).queryByText("A student reply")).not.toBeInTheDocument();
  });

  it.each(["user", "organization"] as const)(
    "keeps main and reply drafts independent for a %s",
    async (account) => {
      const user = userEvent.setup();
      apiMocks.get.mockResolvedValue({ data: { data: { comments, totalPages: 1 } } });
      apiMocks.post.mockResolvedValue({});
      renderComments(account);
      await screen.findByText("Question by the doctor");
      const mainInput = screen.getByRole("textbox", { name: "Your comment" });
      await user.type(mainInput, "My main comment draft");
      await user.click(screen.getAllByRole("button", { name: "Reply" })[0]);
      const replyInput = screen.getByRole("textbox", { name: "Your reply" });
      expect(replyInput).toHaveValue("");
      await user.type(replyInput, "A separate reply");
      expect(mainInput).toHaveValue("My main comment draft");
      await user.click(
        within(screen.getByRole("group", { name: "Write a reply" })).getByRole("button", {
          name: "Reply",
        }),
      );
      await waitFor(() =>
        expect(apiMocks.post).toHaveBeenCalledWith("/comments/comment/comment-user", {
          content: "A separate reply",
        }),
      );
      expect(mainInput).toHaveValue("My main comment draft");
      expect(screen.queryByRole("textbox", { name: "Your reply" })).not.toBeInTheDocument();
    },
  );

  it("posts to the main thread while an independent reply is open", async () => {
    const user = userEvent.setup();
    apiMocks.get.mockResolvedValue({ data: { data: { comments, totalPages: 1 } } });
    apiMocks.post.mockResolvedValue({});
    renderComments("user");
    await screen.findByText("Question by the doctor");
    const mainInput = screen.getByRole("textbox", { name: "Your comment" });
    await user.type(mainInput, "A top-level comment");
    await user.click(screen.getAllByRole("button", { name: "Reply" })[0]);
    const replyInput = screen.getByRole("textbox", { name: "Your reply" });
    await user.type(replyInput, "An unfinished reply");
    await user.click(screen.getByRole("button", { name: "Post comment" }));
    await waitFor(() =>
      expect(apiMocks.post).toHaveBeenCalledWith("/comments/post/post-1", {
        content: "A top-level comment",
      }),
    );
    expect(mainInput).toHaveValue("");
    expect(replyInput).toHaveValue("An unfinished reply");
  });

  it("cancels only the selected reply draft", async () => {
    const user = userEvent.setup();
    apiMocks.get.mockResolvedValue({ data: { data: { comments, totalPages: 1 } } });
    renderComments("user");
    await screen.findByText("Question by the doctor");
    const mainInput = screen.getByRole("textbox", { name: "Your comment" });
    await user.type(mainInput, "Keep my main draft");
    await user.click(screen.getAllByRole("button", { name: "Reply" })[0]);
    await user.type(screen.getByRole("textbox", { name: "Your reply" }), "Discard this reply");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mainInput).toHaveValue("Keep my main draft");
    await user.click(screen.getAllByRole("button", { name: "Reply" })[0]);
    expect(screen.getByRole("textbox", { name: "Your reply" })).toHaveValue("");
    expect(apiMocks.post).not.toHaveBeenCalled();
  });

  it("keeps reply drafts attached to their own comments when switching threads", async () => {
    const user = userEvent.setup();
    apiMocks.get.mockResolvedValue({ data: { data: { comments, totalPages: 1 } } });
    renderComments("user");
    await screen.findByText("Question by the doctor");
    await user.click(screen.getAllByRole("button", { name: "Reply" })[0]);
    await user.type(screen.getByRole("textbox", { name: "Your reply" }), "First thread draft");
    const secondComment = screen.getByText("Organization update").closest("article")!;
    await user.click(within(secondComment).getByRole("button", { name: "Reply" }));
    expect(screen.getByRole("textbox", { name: "Your reply" })).toHaveValue("");
    await user.type(screen.getByRole("textbox", { name: "Your reply" }), "Second thread draft");
    await user.click(screen.getAllByRole("button", { name: "Reply" })[0]);
    expect(screen.getByRole("textbox", { name: "Your reply" })).toHaveValue("First thread draft");
    expect(screen.getByRole("textbox", { name: "Your comment" })).toHaveValue("");
  });

  it("shows the sign-in prompt and empty state to a visitor", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: { comments: [], totalPages: 1 } } });
    renderComments("guest");

    expect(screen.getByRole("heading", { name: "Join the conversation" })).toBeInTheDocument();
    expect(await screen.findByText("No comments yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Post comment" })).not.toBeInTheDocument();
  });

  it("creates a top-level comment and clears the input after success", async () => {
    const user = userEvent.setup();
    apiMocks.get.mockResolvedValue({ data: { data: { comments: [], totalPages: 1 } } });
    apiMocks.post.mockResolvedValue({});
    renderComments("user");

    const input = await screen.findByPlaceholderText("Add a comment...");
    await user.type(input, "  Helpful response  ");
    await user.click(screen.getByRole("button", { name: "Post comment" }));

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
    const replyForm = screen.getByRole("group", { name: "Write a reply" });
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
    await user.click(screen.getByRole("button", { name: "Post comment" }));
    expect(await screen.findByText("Post failed")).toBeInTheDocument();
  });

  it("shows the empty list and a readable error when loading fails", async () => {
    apiMocks.get.mockRejectedValue(new Error("Comments are unavailable"));
    renderComments("guest");

    expect(await screen.findByText("Comments are unavailable")).toBeInTheDocument();
    expect(screen.queryByText("No comments yet")).toBeInTheDocument();
  });
});
