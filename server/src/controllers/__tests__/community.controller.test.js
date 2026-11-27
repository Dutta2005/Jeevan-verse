import { describe, expect, it, vi } from "vitest";
import { getFeed } from "../community.controller.js";
import { getCommunityFeed } from "../../service/community-feed.js";

vi.mock("../../service/community-feed.js", () => ({
  getCommunityFeed: vi.fn(),
}));

function request(query = {}) {
  return new Promise((resolve, reject) => {
    getFeed(
      { query },
      { status: (status) => ({ json: (body) => resolve({ status, body }) }) },
      reject
    );
  });
}

describe("community feed controller", () => {
  it("returns the standard response envelope", async () => {
    const feed = { items: [], nextCursor: null, hasMore: false };
    getCommunityFeed.mockResolvedValueOnce(feed);
    await expect(request()).resolves.toMatchObject({
      status: 200,
      body: { success: true, data: feed },
    });
  });
  it("returns invalid query failures as 400", async () => {
    getCommunityFeed.mockRejectedValueOnce({ statusCode: 400 });
    await expect(request({ type: "bad" })).resolves.toMatchObject({
      status: 400,
      body: { success: false },
    });
  });
  it("does not leak database details in errors", async () => {
    getCommunityFeed.mockRejectedValueOnce(
      new Error("Private database contents")
    );
    const result = await request();
    expect(result).toMatchObject({
      status: 500,
      body: { message: "Could not load community feed" },
    });
    expect(JSON.stringify(result)).not.toContain("Private database contents");
  });
});
