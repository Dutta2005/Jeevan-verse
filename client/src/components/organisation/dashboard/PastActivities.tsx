import { getErrorMessage } from "@/lib/error";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { api } from "@/api/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { EllipsisVertical, Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { format } from "date-fns";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Post {
  content: string;
  title: string;
  tags: string;
  thumbnail: string;
  _id: string;
  createdAt: string;
}

export default function PastActivities() {
  const orgId = useSelector((state: RootState) => state.auth.organization?.id);
  return <OrganizationActivities key={orgId} orgId={orgId} />;
}

function OrganizationActivities({ orgId }: { orgId: string | undefined }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(orgId));
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const getPosts = useCallback(() => {
    if (!orgId) return;
    return api
      .get(`/org-posts/organization/${orgId}`)
      .then((res) => setPosts(res.data.data ?? []))
      .catch((error: unknown) => setError(getErrorMessage(error, "Failed to fetch activities")))
      .finally(() => setIsLoading(false));
  }, [orgId]);

  const deletePost = async (postId: string) => {
    setDeletingId(postId);
    setError(null);
    try {
      await api.delete(`/org-posts/delete/${postId}`);
      await getPosts();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to delete activity"));
    } finally {
      setDeletingId(null);
    }
  };
  useEffect(() => {
    void getPosts();
  }, [getPosts]);

  const visiblePosts = posts.filter((post) =>
    `${post.title} ${post.tags}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section className="flex flex-col gap-6" aria-label="Published posts">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <div>
          <h2 className="flex items-center gap-2 text-base font-medium">
            Published posts{" "}
            {!isLoading && !error && <Badge variant="secondary">{posts.length}</Badge>}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage the updates you’ve shared with your community.
          </p>
        </div>
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search published posts"
            placeholder="Search your posts"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setIsLoading(true);
              setError(null);
              void getPosts();
            }}
          >
            Try again
          </Button>
        </Alert>
      )}
      {isLoading ? (
        <div className="flex flex-col gap-4" aria-label="Loading posts">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : posts.length === 0 && !error ? (
        <Card>
          <CardContent className="pt-6">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No posts yet</EmptyTitle>
                <EmptyDescription>Share your first update with the community</EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" asChild>
                <Link to="/organisation/create">Create post</Link>
              </Button>
            </Empty>
          </CardContent>
        </Card>
      ) : visiblePosts.length === 0 && !error ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No matching posts</EmptyTitle>
            <EmptyDescription>Try a different title or tag.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </Empty>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-2">
          {visiblePosts.map((post) => (
            <Card key={post._id} className="min-w-0 overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle>
                    <h3>{post.title}</h3>
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Actions for ${post.title}`}
                        disabled={deletingId === post._id}
                      >
                        <EllipsisVertical aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link to={`/organisation/edit/${post._id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={deletingId !== null}
                          onSelect={() => void deletePost(post._id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  {post.tags && <Badge variant="secondary">{post.tags}</Badge>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {post.thumbnail && (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    loading="lazy"
                    className="mb-4 aspect-[16/9] w-full rounded-lg object-cover"
                  />
                )}
                <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {post.content}
                </p>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-between gap-3">
                <Button variant="outline" asChild>
                  <Link to={`/organisation/post/${post._id}`}>View post</Link>
                </Button>
                {post.createdAt && !Number.isNaN(Date.parse(post.createdAt)) && (
                  <time dateTime={post.createdAt} className="text-xs text-muted-foreground">
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </time>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
