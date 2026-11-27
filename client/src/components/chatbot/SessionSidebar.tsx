import { useState } from "react";
import { Plus, Ellipsis, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useUmeed } from "./umeed-context";
import type { SessionItem } from "./useChatController";
import styles from "./Umeed.module.css";

interface SessionSidebarProps {
  sessions: SessionItem[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenInsights: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onOpenInsights,
  isLoading,
  disabled = false,
}: SessionSidebarProps) {
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const filtered = [...sessions]
    .sort((a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0))
    .filter((session) => session.title.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <section aria-label="Chat history" className={styles.history}>
      <Button
        variant="outline"
        onClick={onCreateSession}
        disabled={isLoading || disabled}
        className="w-full justify-start"
      >
        <Plus data-icon="inline-start" />
        New chat
      </Button>
      <div className={styles.search}>
        <Search aria-hidden="true" />
        <Input
          aria-label="Search chat titles"
          placeholder="Search chats"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <h2 className={styles.historyLabel}>Recent chats</h2>
      <nav aria-label="Recent chats" className={styles.historyList}>
        {isLoading ? (
          <div className="flex flex-col gap-2" aria-label="Loading chats">
            {[1, 2, 3].map((key) => (
              <Skeleton key={key} className="h-9 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className={styles.historyEmpty}>
            {query ? "No matching chat titles" : "No chats yet"}
          </p>
        ) : (
          <ul>
            {filtered.map((session) => (
              <li
                key={session._id}
                className={styles.historyRow}
                data-active={activeSessionId === session._id}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectSession(session._id)}
                  aria-current={activeSessionId === session._id ? "page" : undefined}
                  title={session.title}
                  className={styles.historyTitle}
                >
                  {session.title || "Untitled chat"}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={styles.historyOptions}
                      disabled={disabled}
                      aria-label={`Options for ${session.title || "Untitled chat"}`}
                    >
                      <Ellipsis aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => setDeleteId(session._id)}>
                        Delete chat
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </nav>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={onOpenInsights}
        disabled={disabled}
      >
        Health insights
      </Button>
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the conversation from your saved chats. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep chat</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDeleteSession(deleteId);
                setDeleteId(null);
              }}
            >
              Delete chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export function UmeedHistory({ onNavigate }: { onNavigate?: () => void }) {
  const chat = useUmeed();
  return (
    <SessionSidebar
      sessions={chat.sessions}
      activeSessionId={chat.activeSessionId}
      isLoading={chat.sessionsLoading}
      disabled={chat.isLoading || chat.isUploading}
      onSelectSession={(id) => {
        void chat.loadSession(id);
        onNavigate?.();
      }}
      onCreateSession={() => {
        void chat.createSession();
        onNavigate?.();
      }}
      onDeleteSession={(id) => void chat.deleteSession(id)}
      onOpenInsights={() => {
        void chat.openInsights();
        onNavigate?.();
      }}
    />
  );
}
