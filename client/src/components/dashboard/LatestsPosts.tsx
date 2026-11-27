import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import type { RootState } from "@/store/store";
import { api } from "@/api/api";
import { getErrorMessage } from "@/lib/error";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import styles from "./Dashboard.module.css";

interface Post {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  tags?: string[];
}

export const LatestsPosts = () => {
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const requestKey = userId;
  const [previousRequestKey, setPreviousRequestKey] = useState(requestKey);
  if (previousRequestKey !== requestKey) {
    setPreviousRequestKey(requestKey);
    setLoading(true);
    setPosts([]);
    setError(null);
  }
  useEffect(() => {
    if (!userId) return;
    let active = true;

    api
      .get(`/posts/user/${userId}`)
      .then((response) => {
        if (active) setPosts(response.data.data ?? []);
      })
      .catch((error: unknown) => {
        if (active) setError(getErrorMessage(error, "Failed to fetch posts"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>
          <h2>Your posts</h2>
        </CardTitle>
        <CardDescription>Discussions you started</CardDescription>
      </CardHeader>
      {loading ? (
        <CardContent>
          <div className="flex flex-col gap-4" aria-label="Loading posts">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      ) : error ? (
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      ) : posts.length === 0 ? (
        <CardContent>
          <Empty className="px-0 py-4">
            <EmptyHeader>
              <EmptyTitle>No posts yet</EmptyTitle>
              <EmptyDescription>Start a discussion or join one already happening</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" asChild>
              <Link to="/discussions">Browse discussions</Link>
            </Button>
          </Empty>
        </CardContent>
      ) : (
        <ul className={styles.postList}>
          {posts.map((post) => (
            <li key={post._id}>
              <Link to={`/discussions/${post._id}`} className={styles.postLink}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <div className={styles.postMeta}>
                  {post.createdAt && !Number.isNaN(Date.parse(post.createdAt)) && (
                    <time dateTime={post.createdAt}>
                      {new Date(post.createdAt).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  )}
                  {post.tags?.map((tag) => (
                    <Badge
                      variant="secondary"
                      key={tag}
                      className="max-w-full whitespace-normal break-all"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
