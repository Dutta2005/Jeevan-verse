import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/api/api";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CommentSection from "@/components/CommentSection";
import type { CommunityFeedItem } from "./community-feed-types";
import PostOwnerActions, { type PostUpdate } from "./PostOwnerActions";
import styles from "./FeedPostCard.module.css";

function PostAuthor({ item }: { item: CommunityFeedItem }) {
  const initials = item.author.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return (
    <div className={styles.identity}>
      <Avatar className="size-8" aria-hidden="true">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className={styles.byline}>
        <div className={styles.author}>
          {item.type === "organization" && item.author.id ? (
            <Link to={`/org-profile/${item.author.id}`}>{item.author.name}</Link>
          ) : (
            <span>{item.author.name}</span>
          )}
          {item.type === "organization" && <Badge variant="outline">Organization</Badge>}
        </div>
        <time dateTime={item.createdAt}>
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </time>
      </div>
    </div>
  );
}

export default function FeedPostCard({
  item: originalItem,
  onDeleted,
}: {
  item: CommunityFeedItem;
  onDeleted?: () => void;
}) {
  const [updatedItem, setUpdatedItem] = useState<CommunityFeedItem | null>(null);
  const [deleted, setDeleted] = useState(false);
  const item = updatedItem ?? originalItem;
  const [commentCount, setCommentCount] = useState<number | null>(item.commentCount ?? null);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const textId = useId();
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const needsContent = expanded || commentsOpen;
  const pending = needsContent && content === null && !error;

  useEffect(() => {
    if (!needsContent || content !== null || error) return;
    let active = true;
    const controller = new AbortController();
    const endpoint = item.type === "organization" ? "/org-posts" : "/posts";
    api
      .get(`${endpoint}/${item.id}`, { signal: controller.signal })
      .then(({ data }) => {
        if (typeof data.data?.content !== "string") throw new Error("Post unavailable");
        if (active) setContent(data.data.content);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [item.id, item.type, needsContent, content, error]);

  const retry = (
    <Alert variant="destructive" className="mt-3">
      <AlertDescription>Could not load the full post.</AlertDescription>
      <Button variant="outline" className="mt-3" onClick={() => setError(false)}>
        Try again
      </Button>
    </Alert>
  );

  const updatePost = (post: PostUpdate) => {
    setContent(post.content);
    setUpdatedItem({
      ...item,
      title: post.title,
      excerpt: post.content.slice(0, 280),
      tags: post.tags,
      author: post.isAnonymous ? { id: null, name: "Anonymous" } : item.author,
    });
  };
  if (deleted) return null;

  return (
    <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
      <article aria-labelledby={titleId}>
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <PostAuthor item={item} />
          </CardHeader>
          {item.thumbnail && (
            <img className={styles.media} src={item.thumbnail} alt={item.title} loading="lazy" />
          )}
          <CardContent className={styles.cardContent}>
            <CardTitle>
              <h2 id={titleId}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className={styles.openPost}
                    onClick={(event) => {
                      openerRef.current = event.currentTarget;
                    }}
                  >
                    {item.title}
                  </button>
                </DialogTrigger>
              </h2>
            </CardTitle>
            <p id={textId} className={styles.caption}>
              {expanded && content !== null ? content : item.excerpt}
            </p>
            {item.excerpt.length >= 280 && (
              <Button
                variant="ghost"
                className={styles.expand}
                disabled={pending}
                aria-expanded={expanded}
                aria-controls={textId}
                onClick={() => setExpanded((value) => !value)}
              >
                {pending && expanded ? "Loading post..." : expanded ? "Show less" : "Read more"}
              </Button>
            )}
            {expanded && error && !commentsOpen && retry}
            {item.tags.length > 0 && (
              <p className={styles.topics}>{item.tags.slice(0, 2).join(", ")}</p>
            )}
          </CardContent>
          <CardFooter className={styles.cardFooter}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                aria-label={`Comments${commentCount !== null ? ` (${commentCount})` : ""}: ${item.title}`}
                title="Comments and replies"
                onClick={(event) => {
                  openerRef.current = event.currentTarget;
                }}
              >
                {commentCount === null
                  ? "Comments"
                  : `${commentCount} ${commentCount === 1 ? "comment" : "comments"}`}
              </Button>
            </DialogTrigger>
          </CardFooter>
        </Card>
      </article>
      <DialogContent
        ref={dialogRef}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          dialogRef.current?.focus({ preventScroll: true });
        }}
        onCloseAutoFocus={(event) => {
          if (openerRef.current?.isConnected) {
            event.preventDefault();
            openerRef.current.focus({ preventScroll: true });
          }
        }}
        className={styles.dialog}
        data-media={Boolean(item.thumbnail)}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{item.title}</DialogTitle>
        {item.thumbnail && (
          <div className={styles.dialogMedia}>
            <img src={item.thumbnail} alt={item.title} />
          </div>
        )}
        <div className={styles.dialogPanel}>
          <div className={styles.dialogHeader}>
            <PostAuthor item={item} />
          </div>
          <div className={styles.dialogScroll}>
            {item.thumbnail && (
              <img className={styles.mobileMedia} src={item.thumbnail} alt={item.title} />
            )}
            <h2 className={styles.dialogPostTitle}>{item.title}</h2>
            <p className={styles.caption}>{content ?? item.excerpt}</p>
            {pending && (
              <p role="status" className={styles.status}>
                Loading full post...
              </p>
            )}
            {error && retry}
            {content !== null && (
              <PostOwnerActions
                item={item}
                content={content}
                onUpdated={updatePost}
                onDeleted={() => {
                  setCommentsOpen(false);
                  setDeleted(true);
                  onDeleted?.();
                }}
              />
            )}
            <div className={styles.comments}>
              <CommentSection postId={item.id} onCountChange={setCommentCount} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
