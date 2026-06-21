import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  MessageSquare,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { Button } from "../ui/button";
import { format } from "date-fns";

interface SessionItem {
  _id: string;
  title: string;
  metadata: {
    messageCount: number;
    mood: string;
    topics: string[];
  };
  updatedAt: string;
  createdAt: string;
}

interface SessionSidebarProps {
  sessions: SessionItem[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenInsights: () => void;
  isLoading: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const moodEmoji: Record<string, string> = {
  anxious: "😰",
  concerned: "😟",
  neutral: "😐",
  positive: "😊",
  curious: "🤔",
  distressed: "😣",
};

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onOpenInsights,
  isLoading,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (deleteConfirm === sessionId) {
      onDeleteSession(sessionId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(sessionId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <>
      {/* Collapse toggle button */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-4 -right-3 z-20 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg hover:bg-secondary/80 transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-light-text/70 dark:text-dark-text/70 uppercase tracking-wider">
                  Sessions
                </h2>
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
                  {sessions.length}/20
                </span>
              </div>

              {/* New Chat Button */}
              <Button
                onClick={onCreateSession}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-secondary to-accent text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
              {sessions.length === 0 ? (
                <div className="text-center p-6 text-light-text/40 dark:text-dark-text/40">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No conversations yet</p>
                </div>
              ) : (
                sessions.map((session, index) => (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <button
                      onClick={() => onSelectSession(session._id)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 group relative ${
                        activeSessionId === session._id
                          ? "bg-gradient-to-r from-secondary/15 to-accent/10 dark:from-secondary/20 dark:to-accent/15 border border-secondary/20 shadow-sm"
                          : "hover:bg-light-text/5 dark:hover:bg-dark-text/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              activeSessionId === session._id
                                ? "text-secondary dark:text-secondary"
                                : "text-light-text dark:text-dark-text"
                            }`}
                          >
                            {session.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-light-text/40 dark:text-dark-text/40" />
                            <span className="text-[11px] text-light-text/50 dark:text-dark-text/50">
                              {format(
                                new Date(session.updatedAt),
                                "MMM d, h:mm a"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-light-text/40 dark:text-dark-text/40">
                              {session.metadata?.messageCount || 0} msgs
                            </span>
                            {session.metadata?.mood && (
                              <span className="text-xs">
                                {moodEmoji[session.metadata.mood] || "😐"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDelete(e, session._id)}
                          className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                            deleteConfirm === session._id
                              ? "bg-red-500/10 text-red-500 opacity-100"
                              : "hover:bg-red-500/10 text-light-text/30 dark:text-dark-text/30 hover:text-red-500"
                          }`}
                          title={
                            deleteConfirm === session._id
                              ? "Click again to confirm"
                              : "Delete session"
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Topic tags */}
                      {session.metadata?.topics &&
                        session.metadata.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.metadata.topics.slice(0, 3).map((topic, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary/70 dark:text-secondary/80"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Insights Button */}
            <div className="p-3 border-t border-light-text/10 dark:border-dark-text/10">
              <Button
                onClick={onOpenInsights}
                variant="outline"
                className="w-full text-xs border-secondary/20 text-secondary hover:bg-secondary/10 dark:border-secondary/30"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-2" />
                Behavior Insights
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SessionSidebar;
