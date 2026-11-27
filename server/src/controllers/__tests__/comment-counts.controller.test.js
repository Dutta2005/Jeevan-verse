import { beforeEach, describe, expect, it, vi } from "vitest";
import { Comment } from "../../models/comment.model.js";
import { getComments } from "../comment.controller.js";
import { getPostCommentCounts } from "../../service/comment-counts.js";

vi.mock("../../service/comment-counts.js", () => ({
  getPostCommentCounts: vi.fn(),
}));
beforeEach(() => {
  const query = {};
  for (const method of ["populate", "skip", "limit"])
    query[method] = vi.fn(() => query);
  query.sort = vi.fn().mockResolvedValue([]);
  vi.spyOn(Comment, "find").mockReturnValue(query);
  vi.spyOn(Comment, "countDocuments").mockResolvedValue(2);
  getPostCommentCounts.mockResolvedValue(new Map([["post-example", 8]]));
});
function read(params) {
  return new Promise((resolve, reject) =>
    getComments(
      { params, query: {} },
      { status: (status) => ({ json: (body) => resolve({ status, body }) }) },
      reject
    )
  );
}
describe("comment-list full-thread metadata", () => {
  it("adds a recursive total without changing top-level pagination", async () => {
    await expect(read({ postId: "post-example" })).resolves.toMatchObject({
      status: 200,
      body: {
        data: { totalComments: 2, totalPages: 1, totalDiscussionComments: 8 },
      },
    });
    expect(getPostCommentCounts).toHaveBeenCalledWith(["post-example"]);
  });
  it("preserves the existing reply-list response", async () => {
    const response = await read({ parentCommentId: "parent-example" });
    expect(getPostCommentCounts).not.toHaveBeenCalled();
    expect(response.body.data).not.toHaveProperty("totalDiscussionComments");
  });
});
