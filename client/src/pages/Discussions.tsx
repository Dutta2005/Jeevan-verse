import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { api } from "@/api/api";
import CreatePost from "@/components/discussion/CreatePost";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import FeedPostCard from "@/components/community/FeedPostCard";
import type {
  CommunitySource as Source,
  CommunityFeedItem as FeedItem,
  CommunityFeedPage as FeedPage,
} from "@/components/community/community-feed-types";
import styles from "./Discussions.module.css";

function CommunityFeed({ source }: { source: Source }) {
  const feedRef = useRef<HTMLElement>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const params = new URLSearchParams({ type: source });
    if (cursor) params.set("cursor", cursor);
    api
      .get(`/community/feed?${params}`, { signal: controller.signal })
      .then(({ data }) => {
        if (!active) return;
        const page: FeedPage = data.data;
        setItems((previous) => {
          const existing = new Set(previous.map((item) => `${item.type}:${item.id}`));
          return [
            ...previous,
            ...page.items.filter((item) => !existing.has(`${item.type}:${item.id}`)),
          ];
        });
        setNextCursor(page.hasMore ? page.nextCursor : null);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [source, cursor, retry]);

  return (
    <section ref={feedRef} tabIndex={-1} aria-label="Community posts" aria-busy={loading}>
      <div className={styles.feed}>
        {items.map((item) => (
          <FeedPostCard
            key={`${item.type}:${item.id}`}
            item={item}
            onDeleted={() => {
              setItems((previous) =>
                previous.filter((post) => post.id !== item.id || post.type !== item.type),
              );
              requestAnimationFrame(() => feedRef.current?.focus({ preventScroll: true }));
            }}
          />
        ))}
      </div>
      {loading && items.length === 0 && (
        <div className={styles.loading} aria-label="Loading posts">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-40 w-full" />
          ))}
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>Could not load posts. Try again.</AlertDescription>
          <Button
            variant="outline"
            className="mt-3"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setError(false);
              setRetry((value) => value + 1);
            }}
          >
            Try again
          </Button>
        </Alert>
      )}
      {!loading && !error && items.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {source === "discussion"
                ? "No discussions yet"
                : source === "organization"
                  ? "No organization updates yet"
                  : "No posts yet"}
            </EmptyTitle>
            <EmptyDescription>
              {source === "organization"
                ? "Organization updates will appear here when published."
                : "Start a conversation with the community."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {nextCursor && !error && (
        <div className={styles.loadMore}>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setCursor(nextCursor);
            }}
          >
            {loading ? "Loading posts..." : "Load more"}
          </Button>
        </div>
      )}
      <span className="sr-only" role="status">
        {loading ? "Loading posts" : `${items.length} posts loaded`}
      </span>
    </section>
  );
}

export default function DiscussionsPage() {
  const [search, setSearch] = useSearchParams();
  const selected = search.get("type");
  const source: Source =
    selected === "discussion" || selected === "organization" ? selected : "all";
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Community</h1>
        <CreatePost trigger={<Button>Create post</Button>} />
      </header>
      <Tabs
        value={source}
        onValueChange={(value) => setSearch(value === "all" ? {} : { type: value })}
      >
        <div className={styles.filters}>
          <TabsList aria-label="Post sources">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="discussion">Discussions</TabsTrigger>
            <TabsTrigger value="organization">Organizations</TabsTrigger>
          </TabsList>
          <span className={styles.sort}>Latest first</span>
        </div>
        <TabsContent value={source}>
          <CommunityFeed key={source} source={source} />
        </TabsContent>
      </Tabs>
      <p className={styles.note}>
        Posts reflect their authors' views and are not a substitute for professional medical advice.
      </p>
    </div>
  );
}
