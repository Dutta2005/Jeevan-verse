import React, { useState, useEffect } from "react";
import { api } from "../api/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { User, Building2, MessageSquare, Trash2, Edit2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface Comment {
  _id: string;
  content: string;
  user?: {
    _id: string;
    name: string;
    status?: string;
  };
  organization?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  parentComment?: string | null;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const organization = useSelector((state: RootState) => state.auth.organization);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    commentId: string | null;
    parentId: string | null;
  }>({
    commentId: null,
    parentId: null,
  });
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async (pageNum = 1) => {
    try {
      const response = await api.get(`/comments/post/${postId}`, {
        params: { page: pageNum, limit: 10 },
      });

      const { comments, totalPages: pages } = response.data.data;
      setComments(comments);
      setTotalPages(pages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch comments");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    try {
      if (!newComment.trim()) return;

      const endpoint = replyTo.commentId
        ? `/comments/comment/${replyTo.commentId}`
        : `/comments/post/${postId}`;

      await api.post(endpoint, { content: newComment });

      setNewComment("");
      setReplyTo({ commentId: null, parentId: null });
      fetchComments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    try {
      await api.patch(`/comments/${commentId}`, { content: editContent });
      setEditingCommentId(null);
      fetchComments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canModifyComment = (comment: Comment) => {
    if (user && comment.user) {
      return user.id === comment.user._id;
    }
    if (organization && comment.organization) {
      return organization.id === comment.organization._id;
    }
    return false;
  };

  const getCommentAuthorDetails = (comment: Comment) => {
    if (comment.user) {
      return {
        name: comment.user.name,
        status: comment.user.status,
        icon: <User size={16} className="text-light-text/50 dark:text-dark-text/50" />,
        type: 'user'
      };
    }
    if (comment.organization) {
      return {
        name: comment.organization.name,
        status: 'organization',
        icon: <Building2 size={16} className="text-light-text/50 dark:text-dark-text/50" />,
        type: 'organization'
      };
    }
    return {
      name: 'Unknown',
      status: '',
      icon: <User size={16} className="text-light-text/50 dark:text-dark-text/50" />,
      type: 'unknown'
    };
  };

  const getCommentBackground = ( status?: string) => {
    if (status === 'doctor') return 'bg-green-200/80 dark:bg-green-900/40';
    if (status === 'medical student') return 'bg-blue-200/80 dark:bg-blue-900/40';
    return '';
  };

  const renderCommentInput = (
    commentId: string | null,
    parentId: string | null,
    isEditing: boolean = false
  ) => {
    const placeholder = isEditing
      ? "Edit your comment..."
      : parentId
      ? "Reply to comment..."
      : "Add a comment...";
    const value = isEditing ? editContent : newComment;
    const onChange = isEditing
      ? (e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)
      : (e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value);
    const onSubmit = isEditing ? () => handleUpdateComment(commentId!) : handleAddComment;

    return (
      <div className="mt-2 bg-light-bg dark:bg-dark-bg p-1 rounded-lg">
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full mb-2 text-light-text dark:text-dark-text"
        />
        <div className="flex justify-between items-center">
          <Button
            onClick={onSubmit}
            disabled={!value.trim()}
            className="mr-2 bg-primary dark:bg-primary dark:text-dark-text hover:bg-primary/90"
          >
            {isEditing ? "Save" : parentId ? "Reply" : "Post Comment"}
          </Button>
        </div>
      </div>
    );
  };

  const renderComments = (commentList: Comment[]) => {
    return commentList.map((comment) => {
      const authorDetails = getCommentAuthorDetails(comment);
      const bgColor = getCommentBackground(comment.user?.status);

      return (
        <div key={comment._id} className={`mb-4 w-full ${bgColor} p-2 rounded-lg`}>
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="flex items-center space-x-2 mb-2">
              {authorDetails.icon}
              <span className="font-medium text-sm text-light-text dark:text-dark-text">
                {authorDetails.name}
              </span>
              <span className="text-xs text-light-text/70 dark:text-dark-text/70">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <div className="flex space-x-2 flex-wrap justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo({ commentId: comment._id, parentId: null })}
                className="text-light-text/70 dark:text-dark-text/70 hover:bg-light-bg/50 dark:hover:bg-dark-bg/50"
              >
                <MessageSquare size={14} className="mr-1" /> Reply
              </Button>
              {canModifyComment(comment) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCommentId(comment._id);
                      setEditContent(comment.content);
                    }}
                    className="text-light-text/70 dark:text-dark-text/70 hover:bg-light-bg/50 dark:hover:bg-dark-bg/50"
                  >
                    <Edit2 size={14} className="mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-primary/70 hover:bg-primary/10"
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          {editingCommentId === comment._id ? (
            renderCommentInput(comment._id, null, true)
          ) : (
            <p className="text-sm text-light-text dark:text-dark-text">
              {comment.content}
            </p>
          )}

          {replyTo.commentId === comment._id && renderCommentInput(replyTo.commentId, null)}

          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 md:ml-8 border-l-2 border-secondary pl-4 mt-2">
              {renderComments(comment.replies)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="mt-6 bg-light-bg dark:bg-dark-bg w-full">
      <CardHeader>
        <CardTitle className="text-center text-light-text dark:text-dark-text text-xl">
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="max-w-4xl mx-auto w-full">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(user || organization) ? (
          renderCommentInput(null, null)
        ) : (
          <Alert className="mb-4">
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>Please sign in to comment</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mt-6 max-w-2xl mx-auto">
          {comments.length === 0 ? (
            <p className="text-center text-light-text/50 dark:text-dark-text/50">
              No comments yet
            </p>
          ) : (
            renderComments(comments)
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => fetchComments(page - 1)}
              className="border-secondary text-light-text dark:text-dark-text"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => fetchComments(page + 1)}
              className="border-secondary text-light-text dark:text-dark-text"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentSection;