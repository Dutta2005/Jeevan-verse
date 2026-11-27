export type CommunitySource = "all" | "discussion" | "organization";

export interface CommunityFeedItem {
  id: string;
  type: Exclude<CommunitySource, "all">;
  title: string;
  excerpt: string;
  tags: string[];
  thumbnail: string;
  createdAt: string;
  commentCount?: number;
  author: { id: string | null; name: string };
}

export interface CommunityFeedPage {
  items: CommunityFeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}
