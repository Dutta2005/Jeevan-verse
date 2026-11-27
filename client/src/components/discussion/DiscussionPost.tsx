import { getErrorMessage } from "@/lib/error";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { api } from "../../api/api";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import CommentSection from "../CommentSection";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import CreatePost from "./CreatePost";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import PostDetailLayout, { PostDetailSkeleton } from "./PostDetailLayout";
import styles from "./PostDetail.module.css";

interface PostDetail {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    name: string;
    _id: string;
  } | null;
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
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Failed to fetch post");
        toast({
          title: "Error",
          description: getErrorMessage(err, "Failed to fetch post"),
          variant: "destructive",
          duration: 4000,
        });
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, toast]);

  const deletePost = async () => {
    try {
      if (!id) {
        throw new Error("No post ID provided");
      }
      await api.delete(`/posts/delete/${id}`);
      navigate("/discussions");
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "Failed to delete post");
      toast({
        title: "Error",
        description: getErrorMessage(err, "Failed to delete post"),
        variant: "destructive",
        duration: 4000,
      });
      setError(errorMessage);
    }
  };

  if (isLoading) return <PostDetailSkeleton />;

  if (error)
    return (
      <div className={styles.page}>
        <Alert variant="destructive">
          <AlertTitle>Could not load post</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  if (!post) return null;

  return (
    <PostDetailLayout
      title={post.title}
      author={<span>{post.author?.name || "Anonymous"}</span>}
      authorName={post.author?.name || "Anonymous"}
      createdAt={post.createdAt}
      tags={post.tags}
      actions={
        userId && userId === post.author?._id ? (
          <>
            <CreatePost
              post={post}
              currentUserId={userId}
              trigger={<Button variant="outline">Edit post</Button>}
            />
            <Button variant="ghost" onClick={deletePost}>
              Delete
            </Button>
          </>
        ) : undefined
      }
      comments={<CommentSection key={post._id} postId={post._id} />}
    >
      <p>{post.content}</p>
    </PostDetailLayout>
  );
};

export default DiscussionPost;
