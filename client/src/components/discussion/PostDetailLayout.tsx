import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./PostDetail.module.css";

export function PostDetailSkeleton() {
  return (
    <div className={styles.page} aria-label="Loading post" aria-busy="true">
      <div className={styles.loading}>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-48 max-w-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

export default function PostDetailLayout({
  title,
  author,
  authorName,
  createdAt,
  tags,
  actions,
  backTo = "/discussions",
  backLabel = "Back to Community",
  children,
  comments,
}: {
  title: string;
  author: ReactNode;
  authorName: string;
  createdAt: string;
  tags: string[];
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
  comments: ReactNode;
}) {
  const { state } = useLocation();
  const from: unknown = state?.communityFrom;
  const communityFrom =
    typeof from === "string" && (from === "/discussions" || from.startsWith("/discussions?"))
      ? from
      : backTo;
  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Link to={communityFrom} className={styles.back}>
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          {backLabel}
        </Link>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <article className={styles.article}>
        <header>
          <div className={styles.metadata}>
            <Avatar className="size-8" aria-hidden="true">
              <AvatarFallback>
                {authorName
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={styles.byline}>
              <div className={styles.author}>{author}</div>
              <time dateTime={createdAt}>
                {new Date(createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>
          </div>
          <h1 className={styles.title}>{title}</h1>
          {tags.length > 0 && (
            <ul className={styles.tags} aria-label="Topics">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </header>
        <div className={styles.body}>{children}</div>
      </article>
      <div className={styles.comments}>{comments}</div>
    </div>
  );
}
