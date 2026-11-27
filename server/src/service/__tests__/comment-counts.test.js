import { describe, expect, it, vi } from "vitest";
import { Comment } from "../../models/comment.model.js";
import { getPostCommentCounts } from "../comment-counts.js";

describe("full-thread comment counts", () => {
  it("skips database work for an empty page", async () => {
    const aggregate = vi.spyOn(Comment, "aggregate");
    await expect(getPostCommentCounts([])).resolves.toEqual(new Map());
    expect(aggregate).not.toHaveBeenCalled();
  });
  it("batches root selection and recursively follows parent links for legacy replies", async () => {
    const aggregate = vi.spyOn(Comment, "aggregate").mockResolvedValue([
      { _id: "post-a", count: 6 },
      { _id: "post-b", count: 1 },
    ]);
    await expect(
      getPostCommentCounts(["post-a", "post-a", "post-b"])
    ).resolves.toEqual(
      new Map([
        ["post-a", 6],
        ["post-b", 1],
      ])
    );
    expect(aggregate).toHaveBeenCalledOnce();
    const pipeline = aggregate.mock.calls[0][0];
    expect(pipeline[0]).toEqual({
      $match: { post: { $in: ["post-a", "post-b"] }, parentComment: null },
    });
    expect(pipeline[2]).toEqual({
      $graphLookup: {
        from: Comment.collection.name,
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentComment",
        as: "threadReplies",
      },
    });
    expect(pipeline[3]).toEqual({
      $project: {
        post: 1,
        threadCount: { $add: [1, { $size: "$threadReplies" }] },
      },
    });
    expect(pipeline[4]).toEqual({
      $group: { _id: "$post", count: { $sum: "$threadCount" } },
    });
  });
});
