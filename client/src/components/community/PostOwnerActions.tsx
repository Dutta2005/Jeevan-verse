import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { api } from "@/api/api";
import CreatePost from "@/components/discussion/CreatePost";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { CommunityFeedItem } from "./community-feed-types";
import styles from "./FeedPostCard.module.css";

export interface PostUpdate {
  title: string;
  content: string;
  tags: string[];
  isAnonymous?: boolean;
}

export default function PostOwnerActions({
  item,
  content,
  onUpdated,
  onDeleted,
}: {
  item: CommunityFeedItem;
  content: string;
  onUpdated: (post: PostUpdate) => void;
  onDeleted: () => void;
}) {
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);
  const editablePost = useMemo(
    () => ({
      _id: item.id,
      title: item.title,
      content,
      tags: item.tags,
      author: { _id: item.author.id ?? "", name: item.author.name },
    }),
    [item.id, item.title, content, item.tags, item.author.id, item.author.name],
  );
  if (item.type !== "discussion" || !userId || item.author.id !== userId) return null;

  return (
    <div className={styles.ownerActions}>
      <CreatePost
        post={editablePost}
        currentUserId={userId}
        trigger={<Button variant="ghost">Edit post</Button>}
        onUpdated={onUpdated}
      />
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setConfirmOpen(open);
            setError(false);
          }
        }}
      >
        <AlertDialogTrigger asChild>
          <Button variant="ghost">Delete post</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes your post and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>Could not delete the post. Try again.</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={async (event) => {
                event.preventDefault();
                if (deleting) return;
                setDeleting(true);
                setError(false);
                try {
                  await api.delete(`/posts/delete/${item.id}`);
                  setConfirmOpen(false);
                  onDeleted();
                } catch {
                  setError(true);
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
