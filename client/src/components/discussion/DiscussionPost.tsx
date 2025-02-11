import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/api";
import {
  Card,
  CardContent,
  CardHeader,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Clock,
  User,
  AlertCircle,
  Pencil,
  EllipsisVertical,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import DiscussionPostSkeleton from "./DiscussionPostSkeleton";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import CreatePost from "./CreatePost";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useToast } from "../../hooks/use-toast";

interface PostDetail {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    name: string;
    _id: string;
  };
  createdAt: string;
}

const DiscussionPost = () => {
  const { id } = useParams();
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!id) {
          throw new Error("No post ID provided");
        }
        const response = await api.get(`/posts/${id}`);
        setPost(response.data.data);
        setIsLoading(false);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to fetch post";
        toast({
          title: "Error",
          description:
            err.response?.data?.message ||
            err.message ||
            "Failed to fetch post",
          variant: "destructive",
          duration: 4000,
        });
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const deletePost = async () => {
    try {
      if (!id) {
        throw new Error("No post ID provided");
      }
      await api.delete(`/posts/delete/${id}`);
      navigate("/discussions");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete post";
      toast({
        title: "Error",
        description:
          err.response?.data?.message || err.message || "Failed to delete post",
        variant: "destructive",
        duration: 4000,
      });
      setError(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) return <DiscussionPostSkeleton />;

  if (error)
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );

  if (!post) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="bg-light-bg dark:bg-dark-bg border-none shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-primary">{post.title}</h1>
            {userId === post.author._id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <EllipsisVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-light-bg dark:bg-dark-bg p-2">
                  <CreatePost
                    post={post}
                    trigger={
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 hover:bg-secondary/10"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                    }
                    currentUserId={userId}
                  />
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 hover:bg-primary/10 text-primary"
                    onClick={deletePost}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex flex-wrap gap-4 items-center text-sm">
            <div className="flex items-center gap-2 text-secondary">
              <User size={16} />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2 text-accent">
              <Clock size={16} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <Badge 
              variant="outline" 
              className="bg-secondary/10 text-secondary border-secondary/20"
            >
              {post.tags[0]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-light-text dark:text-dark-text leading-relaxed">
              {post.content}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscussionPost;