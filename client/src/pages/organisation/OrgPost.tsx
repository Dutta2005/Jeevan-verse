import { getErrorMessage } from "@/lib/error";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../../api/api";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import CommentSection from "@/components/CommentSection";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import PostDetailLayout, { PostDetailSkeleton } from "@/components/discussion/PostDetailLayout";
import { Badge } from "@/components/ui/badge";
import styles from "@/components/discussion/PostDetail.module.css";

interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string;
  thumbnail: string;
  organization: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

function OrgPost() {
  const postId = useParams<{ id: string }>().id;
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = useSelector((state: RootState) => state.auth.role);

  useEffect(() => {
    const getPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get(`/org-posts/${postId}`);
        setPost(response.data.data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to fetch post"));
      } finally {
        setIsLoading(false);
      }
    };

    getPost();
  }, [postId]);

  if (error) {
    return (
      <div className={styles.page}>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className={styles.page}>
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The requested post could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <PostDetailLayout
      title={post.title}
      authorName={post.organization.name}
      author={
        <>
          <Link
            to={`/${role === "organization" ? "organisation/" : ""}org-profile/${post.organization._id}`}
          >
            {post.organization.name}
          </Link>
          <Badge variant="outline">Organization</Badge>
        </>
      }
      createdAt={post.createdAt}
      tags={post.tags ? [post.tags] : []}
      backTo={role === "organization" ? "/organisation/posts" : "/discussions?type=organization"}
      backLabel={role === "organization" ? "Back to posts" : "Back to Community"}
      comments={<CommentSection key={post._id} postId={post._id} />}
    >
      <p>{post.content}</p>
      {post.thumbnail && <img src={post.thumbnail} alt={post.title} className={styles.image} />}
    </PostDetailLayout>
  );
}

export default OrgPost;
