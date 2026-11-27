import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { OrgPost } from "../models/orgPost.model.js";
import { ApiError } from "../utils/apiError.js";
import { getPostCommentCounts } from "./comment-counts.js";

const types = ["all", "discussion", "organization"];
const invalid = () => new ApiError(400, "Invalid community feed query");

function readQuery(query) {
  const type = query.type === undefined ? "all" : query.type;
  if (!types.includes(type)) throw invalid();
  const rawLimit = query.limit === undefined ? "20" : query.limit;
  if (typeof rawLimit !== "string" || !/^\d+$/.test(rawLimit)) throw invalid();
  const limit = Number(rawLimit);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) throw invalid();
  let cursor = null;
  if (query.cursor !== undefined) {
    if (
      typeof query.cursor !== "string" ||
      query.cursor.length > 512 ||
      !/^[\w-]+$/.test(query.cursor)
    )
      throw invalid();
    try {
      cursor = JSON.parse(
        Buffer.from(query.cursor, "base64url").toString("utf8")
      );
      if (
        !cursor ||
        cursor.v !== 1 ||
        cursor.filter !== type ||
        !["discussion", "organization"].includes(cursor.kind) ||
        (type !== "all" && cursor.kind !== type) ||
        typeof cursor.id !== "string" ||
        !/^[a-f0-9]{24}$/.test(cursor.id) ||
        typeof cursor.at !== "string" ||
        new Date(cursor.at).toISOString() !== cursor.at
      )
        throw invalid();
    } catch {
      throw invalid();
    }
  }
  return { type, limit, cursor };
}

function boundary(cursor, kind) {
  if (!cursor) return {};
  const at = new Date(cursor.at);
  const id = new mongoose.Types.ObjectId(cursor.id);
  const clauses = [
    { createdAt: { $lt: at } },
    { createdAt: at, _id: { $lt: id } },
  ];
  // ObjectIds can collide across collections; type is the final sort key.
  if (kind < cursor.kind) clauses.push({ createdAt: at, _id: id });
  return { $or: clauses };
}

function normalize(post, type) {
  const author = type === "organization" ? post.organization : post.author;
  const anonymous = type === "discussion" && post.isAnonymous;
  return {
    id: String(post._id),
    type,
    title: post.title,
    excerpt: (post.content || "").slice(0, 280),
    tags: Array.isArray(post.tags) ? post.tags : post.tags ? [post.tags] : [],
    thumbnail: type === "organization" ? post.thumbnail || "" : "",
    createdAt: new Date(post.createdAt).toISOString(),
    author: {
      id: anonymous || !author?._id ? null : String(author._id),
      name: anonymous
        ? "Anonymous"
        : author?.name ||
          (type === "organization" ? "Organization" : "Community member"),
    },
  };
}

export async function getCommunityFeed(query = {}) {
  const { type, limit, cursor } = readQuery(query);
  const sources = [
    ["discussion", Post, "author"],
    ["organization", OrgPost, "organization"],
  ].filter(([kind]) => type === "all" || type === kind);
  const pages = await Promise.all(
    sources.map(async ([kind, model, author]) => {
      const posts = await model
        .find(boundary(cursor, kind))
        .select(
          "title content tags thumbnail createdAt author organization isAnonymous"
        )
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .populate(author, "name")
        .lean();
      return posts.map((post) => normalize(post, kind));
    })
  );
  const merged = pages.flat().sort((a, b) => {
    for (const key of ["createdAt", "id", "type"]) {
      if (a[key] !== b[key]) return a[key] > b[key] ? -1 : 1;
    }
    return 0;
  });
  const items = merged.slice(0, limit);
  const commentCounts = await getPostCommentCounts(
    items.map((item) => item.id)
  );
  for (const item of items) item.commentCount = commentCounts.get(item.id) ?? 0;
  const hasMore = merged.length > limit;
  const last = items.at(-1);
  const nextCursor = hasMore
    ? Buffer.from(
        JSON.stringify({
          v: 1,
          filter: type,
          at: last.createdAt,
          id: last.id,
          kind: last.type,
        })
      ).toString("base64url")
    : null;
  return { items, nextCursor, hasMore };
}
