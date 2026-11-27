import { beforeEach, describe, expect, it, vi } from "vitest";
import { Post } from "../../models/post.model.js";
import { OrgPost } from "../../models/orgPost.model.js";
import { Comment } from "../../models/comment.model.js";
import { getCommunityFeed } from "../community-feed.js";

const date = "2026-11-27T10:00:00.000Z";
const id = (n) => n.toString(16).padStart(24, "0");
function query(items) {
  const chain = {};
  for (const method of ["select", "sort", "limit", "populate"])
    chain[method] = vi.fn(() => chain);
  chain.lean = vi.fn().mockResolvedValue(items);
  return chain;
}
let discussions;
let organizations;
beforeEach(() => {
  discussions = query([]);
  organizations = query([]);
  vi.spyOn(Post, "find").mockReturnValue(discussions);
  vi.spyOn(OrgPost, "find").mockReturnValue(organizations);
  vi.spyOn(Comment, "aggregate").mockResolvedValue([]);
});
const post = (n, extra = {}) => ({
  _id: id(n),
  title: `Post ${n}`,
  content: "Synthetic content",
  createdAt: new Date(date),
  tags: ["question"],
  author: { _id: id(99), name: "Member", email: "private@example.test" },
  ...extra,
});

describe("community feed", () => {
  it("attaches full-thread counts only for the returned page", async () => {
    discussions.lean.mockResolvedValue([post(3), post(1)]);
    organizations.lean.mockResolvedValue([post(2)]);
    Comment.aggregate.mockResolvedValue([{ _id: id(3), count: 7 }]);
    const feed = await getCommunityFeed({ limit: "2" });
    expect(feed.items.map((item) => item.commentCount)).toEqual([7, 0]);
    expect(Comment.aggregate.mock.calls[0][0][0]).toEqual({
      $match: { post: { $in: [id(3), id(2)] }, parentComment: null },
    });
  });
  it("orders by creation date before id, regardless of source", async () => {
    discussions.lean.mockResolvedValue([
      post(99, { createdAt: new Date("2026-11-26T10:00:00.000Z") }),
    ]);
    organizations.lean.mockResolvedValue([post(1)]);
    const feed = await getCommunityFeed();
    expect(feed.items.map((item) => item.id)).toEqual([id(1), id(99)]);
  });
  it("pages through mixed sources without repeating or skipping timestamp/id ties", async () => {
    const rows = {
      discussion: [
        post(3),
        post(1),
        post(7, { createdAt: new Date("2026-11-26T10:00:00.000Z") }),
      ],
      organization: [post(3), post(2)],
    };
    const stubSource = (kind) => (filter) => {
      let limit;
      const chain = query([]);
      chain.limit.mockImplementation((value) => {
        limit = value;
        return chain;
      });
      chain.lean.mockImplementation(async () =>
        rows[kind]
          .filter((row) => {
            if (!filter.$or) return true;
            return filter.$or.some((clause) => {
              if (clause.createdAt.$lt)
                return row.createdAt < clause.createdAt.$lt;
              if (row.createdAt.getTime() !== clause.createdAt.getTime())
                return false;
              return clause._id.$lt
                ? String(row._id) < String(clause._id.$lt)
                : String(row._id) === String(clause._id);
            });
          })
          .slice(0, limit)
      );
      return chain;
    };
    Post.find.mockImplementation(stubSource("discussion"));
    OrgPost.find.mockImplementation(stubSource("organization"));
    const seen = [];
    let cursor;
    for (let page = 0; page < 5; page += 1) {
      const result = await getCommunityFeed({
        limit: "1",
        ...(cursor ? { cursor } : {}),
      });
      seen.push(...result.items.map((item) => `${item.type}:${item.id}`));
      cursor = result.nextCursor;
      if (!result.hasMore) break;
    }
    expect(cursor).toBeNull();
    expect(seen).toEqual([
      `organization:${id(3)}`,
      `discussion:${id(3)}`,
      `organization:${id(2)}`,
      `discussion:${id(1)}`,
      `discussion:${id(7)}`,
    ]);
  });
  it("merges both sources before limiting and returns a usable next cursor", async () => {
    discussions.lean.mockResolvedValue([post(3), post(1)]);
    organizations.lean.mockResolvedValue([
      post(2, {
        organization: { _id: id(98), name: "Organization" },
        tags: "news",
      }),
    ]);
    const feed = await getCommunityFeed({ limit: "2" });
    expect(feed.items.map((item) => item.id)).toEqual([id(3), id(2)]);
    expect(feed.hasMore).toBe(true);
    expect(feed.nextCursor).toEqual(expect.any(String));
    expect(feed.items[1]).toMatchObject({
      type: "organization",
      tags: ["news"],
      author: { id: id(98), name: "Organization" },
    });
    expect(discussions.limit).toHaveBeenCalledWith(3);
    expect(organizations.limit).toHaveBeenCalledWith(3);
    await getCommunityFeed({ limit: "2", cursor: feed.nextCursor });
    expect(Post.find).toHaveBeenLastCalledWith({
      $or: [
        { createdAt: { $lt: new Date(date) } },
        { createdAt: new Date(date), _id: { $lt: expect.anything() } },
        { createdAt: new Date(date), _id: expect.anything() },
      ],
    });
    expect(OrgPost.find.mock.calls.at(-1)[0].$or).toHaveLength(2);
  });
  it("orders identical ids and timestamps consistently across sources", async () => {
    discussions.lean.mockResolvedValue([post(1)]);
    organizations.lean.mockResolvedValue([post(1)]);
    const feed = await getCommunityFeed({ limit: "1" });
    expect(feed.items[0].type).toBe("organization");
    await getCommunityFeed({ limit: "1", cursor: feed.nextCursor });
    expect(Post.find.mock.calls.at(-1)[0].$or).toHaveLength(3);
    expect(OrgPost.find.mock.calls.at(-1)[0].$or).toHaveLength(2);
  });
  it("does not fetch excluded sources or expose anonymous authors", async () => {
    discussions.lean.mockResolvedValue([post(1, { isAnonymous: true })]);
    const feed = await getCommunityFeed({ type: "discussion" });
    expect(OrgPost.find).not.toHaveBeenCalled();
    expect(feed.items[0].author).toEqual({ id: null, name: "Anonymous" });
    expect(JSON.stringify(feed)).not.toContain("private@example.test");
    expect(feed.nextCursor).toBeNull();
  });
  it("fetches only organizations when requested", async () => {
    await expect(
      getCommunityFeed({ type: "organization" })
    ).resolves.toMatchObject({ items: [], hasMore: false, nextCursor: null });
    expect(Post.find).not.toHaveBeenCalled();
  });
  it.each([
    { type: "invalid" },
    { type: ["all"] },
    { limit: "0" },
    { limit: "51" },
    { limit: "2x" },
    { cursor: "broken" },
    { cursor: ["x"] },
  ])("rejects malformed input before querying: %j", async (input) => {
    await expect(getCommunityFeed(input)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(Post.find).not.toHaveBeenCalled();
    expect(OrgPost.find).not.toHaveBeenCalled();
  });
  it("rejects a cursor reused with a different source filter", async () => {
    discussions.lean.mockResolvedValue([post(2), post(1)]);
    const feed = await getCommunityFeed({ limit: "1" });
    Post.find.mockClear();
    OrgPost.find.mockClear();
    await expect(
      getCommunityFeed({ type: "discussion", cursor: feed.nextCursor })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(Post.find).not.toHaveBeenCalled();
  });
});
