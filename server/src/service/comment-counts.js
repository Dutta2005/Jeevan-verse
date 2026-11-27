import { Comment } from "../models/comment.model.js";

// Replies in existing records do not store a post id, so follow their parent links.
export async function getPostCommentCounts(postIds) {
  const ids = [...new Set(postIds)];
  if (!ids.length) return new Map();
  const counts = await Comment.aggregate([
    { $match: { post: { $in: ids }, parentComment: null } },
    { $project: { _id: 1, post: 1 } },
    {
      $graphLookup: {
        from: Comment.collection.name,
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentComment",
        as: "threadReplies",
      },
    },
    {
      $project: {
        post: 1,
        threadCount: { $add: [1, { $size: "$threadReplies" }] },
      },
    },
    { $group: { _id: "$post", count: { $sum: "$threadCount" } } },
  ]);
  return new Map(counts.map((row) => [String(row._id), row.count]));
}
