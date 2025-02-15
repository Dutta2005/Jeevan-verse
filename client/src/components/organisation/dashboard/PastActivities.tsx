import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { api } from "../../../api/api";
import { Alert, AlertDescription } from "../../ui/alert";
import { Card, CardHeader, CardContent, CardFooter } from "../../ui/card";
import { EllipsisVertical, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router";
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../ui/dropdown-menu";

interface Post {
  content: string;
  title: string;
  tags: string;
  thumbnail: string;
  _id: string;
  createdAt: string;
}

const PastActivities = () => {
  const orgId = useSelector((state: RootState) => state.auth.organization?.id);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/org-posts/organization/${orgId}`);
      setPosts(res.data.data);
      console.log("Posts:", res.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await api.delete(`/org-posts/delete/${postId}`);
      getPosts();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete activity");
    }
  };

  useEffect(() => {
    if (orgId) {
      getPosts();
    }
  }, [orgId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-16">
      <h1 className="text-2xl md:text-4xl font-bold my-8 dark:text-dark-text">
        Past Activities
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {posts.length === 0 && !error ? (
        <Card className="flex justify-center">
          <CardContent className="p-6">
            <p className="text-light-text text-center dark:bg-dark-bg">
              No activities found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:mx-10">
          {posts.map((post) => (
            <Card
              key={post._id}
              className="transition-all duration-300 hover:shadow-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-xl font-bold text-primary">
                    {post.title}
                  </h2>
                  <div className="flex justify-between items-center gap-4">
                  {post.tags && (
                    <p className="bg-accent text-white rounded-full px-3 py-1 text-xs font-medium">
                      {post.tags}
                    </p>
                  )}
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <EllipsisVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-light-bg dark:bg-dark-bg p-2">
                <Link to={`edit/${post._id}`}>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-primary/10 text-primary"
                    onClick={deletePost.bind(null, post._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {post.thumbnail && (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-auto aspect-[16/9] object-cover rounded-md mb-4"
                  />
                )}
                <p className="text-light-text whitespace-pre-wrap dark:text-dark-text">
                  {post.content}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Link
                  to={`post/${post._id}`}
                  className="flex items-center mt-2 text-accent transition-colors duration-200"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Post
                </Link>
                <time className="text-sm text-light-text dark:text-dark-text">
                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                </time>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastActivities;
