import { getErrorMessage } from "@/lib/error";
import React, { useState, useCallback, useEffect, useId, useRef } from "react";
import { api } from "../api/api";
import { Button } from "./ui/button";
import { InputGroup, InputGroupTextarea, InputGroupAddon } from "./ui/input-group";
import { Field, FieldLabel } from "./ui/field";
import { Badge } from "./ui/badge";
import styles from "./CommentSection.module.css";
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
  onCountChange?: (count: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCountChange }) => {
  const composerId = useId();
  const user = useSelector((state: RootState) => state.auth.user);
  const organization = useSelector((state: RootState) => state.auth.organization);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
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
  const requestSequence = useRef(0);

  const fetchComments = useCallback(
    (pageNum = 1) => {
      const requestId = ++requestSequence.current;
      return api
        .get(`/comments/post/${postId}`, {
          params: { page: pageNum, limit: 10 },
        })
        .then((response) => {
          if (requestId !== requestSequence.current) return;
          const { comments, totalPages: pages, totalDiscussionComments } = response.data.data;
          setComments(comments);
          setTotalPages(pages);
          setPage(pageNum);
          if (Number.isSafeInteger(totalDiscussionComments) && totalDiscussionComments >= 0)
            onCountChange?.(totalDiscussionComments);
        })
        .catch((err: unknown) => {
          if (requestId !== requestSequence.current) return;
          setError(getErrorMessage(err, "Failed to fetch comments"));
        });
    },
    [postId, onCountChange],
  );

  useEffect(() => {
    void fetchComments();
    return () => {
      requestSequence.current += 1;
    };
  }, [fetchComments]);

  const handleAddComment = async (replyCommentId: string | null = null) => {
    const content = replyCommentId ? replyDrafts[replyCommentId] || "" : newComment;
    try {
      if (!content.trim()) return;

      const endpoint = replyCommentId
        ? `/comments/comment/${replyCommentId}`
        : `/comments/post/${postId}`;

      await api.post(endpoint, { content });

      if (replyCommentId) {
        setReplyDrafts((drafts) =>
          drafts[replyCommentId] === content ? { ...drafts, [replyCommentId]: "" } : drafts,
        );
        setReplyTo((current) =>
          current.commentId === replyCommentId ? { commentId: null, parentId: null } : current,
        );
      } else {
        setNewComment((draft) => (draft === content ? "" : draft));
      }
      fetchComments();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to add comment"));
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    try {
      await api.patch(`/comments/${commentId}`, { content: editContent });
      setEditingCommentId(null);
      fetchComments();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update comment"));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete comment"));
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

  const renderCommentInput = (
    commentId: string | null,
    parentId: string | null,
    isEditing = false,
  ) => {
    const placeholder = isEditing
      ? "Edit your comment..."
      : parentId
        ? "Reply to comment..."
        : "Add a comment...";
    const replyCommentId = !isEditing && parentId ? commentId : null;
    const value = isEditing
      ? editContent
      : replyCommentId
        ? replyDrafts[replyCommentId] || ""
        : newComment;
    const inputId = `${composerId}-${isEditing ? "edit" : "comment"}-${commentId || "new"}`;
    const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (isEditing) setEditContent(event.target.value);
      else if (replyCommentId) {
        const nextDraft = event.target.value;
        setReplyDrafts((drafts) => ({ ...drafts, [replyCommentId]: nextDraft }));
      } else setNewComment(event.target.value);
    };
    return (
      <div
        className={styles.composer}
        role="group"
        aria-label={isEditing ? "Edit comment" : parentId ? "Write a reply" : "Write a comment"}
      >
        <Field>
          <FieldLabel htmlFor={inputId} className="sr-only">
            {isEditing ? "Edit comment" : parentId ? "Your reply" : "Your comment"}
          </FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id={inputId}
              rows={2}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              className={styles.textarea}
            />
            <InputGroupAddon align="block-end" className={styles.composerActions}>
              {(isEditing || parentId) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (isEditing) setEditingCommentId(null);
                    else {
                      if (replyCommentId) {
                        setReplyDrafts((drafts) => {
                          const remaining = { ...drafts };
                          delete remaining[replyCommentId];
                          return remaining;
                        });
                      }
                      setReplyTo({ commentId: null, parentId: null });
                    }
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                disabled={!value.trim()}
                onClick={
                  isEditing
                    ? () => handleUpdateComment(commentId!)
                    : () => handleAddComment(replyCommentId)
                }
              >
                {isEditing ? "Save" : parentId ? "Reply" : "Post comment"}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </div>
    );
  };

  const renderComments = (commentList: Comment[], depth = 0): React.ReactNode =>
    commentList.map((comment) => (
      <article key={comment._id} className={styles.comment}>
        <div
          className={styles.commentBody}
          data-profession={
            comment.user?.status === "doctor" || comment.user?.status === "medical student"
              ? comment.user.status
              : undefined
          }
        >
          <div className={styles.metadata}>
            <span className={styles.author}>
              {comment.user?.name || comment.organization?.name || "Unknown"}
            </span>
            {comment.organization && <Badge variant="outline">Organization</Badge>}
            {(comment.user?.status === "doctor" || comment.user?.status === "medical student") && (
              <Badge
                variant="outline"
                title="Self-reported profile role"
                aria-label={`Self-reported role: ${comment.user.status === "doctor" ? "Doctor" : "Medical student"}`}
              >
                {comment.user.status === "doctor" ? "Doctor" : "Medical student"}
              </Badge>
            )}
            <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
          </div>
          {editingCommentId === comment._id ? (
            renderCommentInput(comment._id, null, true)
          ) : (
            <p className={styles.content}>{comment.content}</p>
          )}
          <div className={styles.actions}>
            {(user || organization) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo({ commentId: comment._id, parentId: comment._id })}
              >
                Reply
              </Button>
            )}
            {canModifyComment(comment) && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingCommentId(comment._id);
                    setEditContent(comment.content);
                  }}
                >
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment._id)}>
                  Delete
                </Button>
              </>
            )}
          </div>
          {replyTo.commentId === comment._id &&
            renderCommentInput(replyTo.commentId, replyTo.parentId)}
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className={depth < 2 ? styles.replies : styles.deepReplies}>
            {renderComments(comment.replies, depth + 1)}
          </div>
        )}
      </article>
    ));

  return (
    <section className={styles.section} aria-label="Comments">
      <h2 className={styles.heading}>Comments</h2>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {user || organization ? (
        renderCommentInput(null, null)
      ) : (
        <Alert>
          <AlertTitle>Join the conversation</AlertTitle>
          <AlertDescription>Please sign in to comment</AlertDescription>
        </Alert>
      )}
      <div className={styles.list}>
        {comments.length === 0 ? (
          <p className={styles.empty}>No comments yet</p>
        ) : (
          renderComments(comments)
        )}
      </div>
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button variant="outline" disabled={page === 1} onClick={() => fetchComments(page - 1)}>
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => fetchComments(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
};

export default CommentSection;
