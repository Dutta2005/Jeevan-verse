import React from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  MessageSquare,
  TrendingUp,
  Hash,
  Activity,
  X,
} from "lucide-react";
import { Button } from "../ui/button";

interface BehaviorData {
  totalSessions: number;
  totalMessages: number;
  frequentTopics: { topic: string; count: number }[];
  moodDistribution: Record<string, number>;
  averageSessionLength: number;
  consultationFrequency: string;
  recentActivity: {
    title: string;
    date: string;
    messageCount: number;
    mood: string;
    topics: string[];
  }[];
}

interface BehaviorInsightsProps {
  data: BehaviorData | null;
  isLoading: boolean;
  onClose: () => void;
}

const moodColors: Record<string, string> = {
  anxious: "bg-amber-500",
  concerned: "bg-orange-500",
  neutral: "bg-gray-400",
  positive: "bg-emerald-500",
  curious: "bg-blue-500",
  distressed: "bg-red-500",
};

const moodEmoji: Record<string, string> = {
  anxious: "😰",
  concerned: "😟",
  neutral: "😐",
  positive: "😊",
  curious: "🤔",
  distressed: "😣",
};

const frequencyColors: Record<string, string> = {
  "very high": "text-red-500",
  high: "text-orange-500",
  moderate: "text-secondary",
  low: "text-emerald-500",
  none: "text-gray-400",
};

const BehaviorInsights: React.FC<BehaviorInsightsProps> = ({
  data,
  isLoading,
  onClose,
}) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center">
          <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-light-text/60 dark:text-dark-text/60">
            Analyzing your behavior patterns...
          </p>
        </div>
      </motion.div>
    );
  }

  if (!data) return null;

  const totalMoods = Object.values(data.moodDistribution).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">
              Behavior Insights
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 dark:from-secondary/15 dark:to-secondary/5 rounded-xl p-3 text-center">
              <MessageSquare className="w-5 h-5 text-secondary mx-auto mb-1" />
              <p className="text-2xl font-bold text-secondary">
                {data.totalSessions}
              </p>
              <p className="text-[10px] text-light-text/50 dark:text-dark-text/50 uppercase tracking-wider">
                Sessions
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/15 dark:to-accent/5 rounded-xl p-3 text-center">
              <Hash className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-2xl font-bold text-accent">
                {data.totalMessages}
              </p>
              <p className="text-[10px] text-light-text/50 dark:text-dark-text/50 uppercase tracking-wider">
                Messages
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/5 rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-primary">
                {data.averageSessionLength}
              </p>
              <p className="text-[10px] text-light-text/50 dark:text-dark-text/50 uppercase tracking-wider">
                Avg msgs/session
              </p>
            </div>
          </div>

          {/* Consultation Frequency */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-light-text/50 dark:text-dark-text/50" />
                <span className="text-sm text-light-text/70 dark:text-dark-text/70">
                  Consultation Frequency
                </span>
              </div>
              <span
                className={`text-sm font-semibold capitalize ${
                  frequencyColors[data.consultationFrequency] || "text-gray-400"
                }`}
              >
                {data.consultationFrequency}
              </span>
            </div>
          </div>

          {/* Frequent Topics */}
          {data.frequentTopics.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-light-text/50 dark:text-dark-text/50 uppercase tracking-wider mb-2">
                Frequently Discussed Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.frequentTopics.map((t, i) => (
                  <motion.span
                    key={t.topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20 dark:border-secondary/30"
                  >
                    {t.topic}
                    <span className="ml-1.5 text-secondary/50">×{t.count}</span>
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Mood Distribution */}
          {totalMoods > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-light-text/50 dark:text-dark-text/50 uppercase tracking-wider mb-2">
                Mood Distribution
              </h3>
              <div className="space-y-2">
                {Object.entries(data.moodDistribution).map(([mood, count]) => {
                  const percentage = Math.round((count / totalMoods) * 100);
                  return (
                    <div key={mood} className="flex items-center gap-2">
                      <span className="text-sm w-6 text-center">
                        {moodEmoji[mood] || "😐"}
                      </span>
                      <span className="text-xs capitalize text-light-text/60 dark:text-dark-text/60 w-20">
                        {mood}
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            moodColors[mood] || "bg-gray-400"
                          }`}
                        />
                      </div>
                      <span className="text-xs text-light-text/40 dark:text-dark-text/40 w-8 text-right">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {data.totalSessions === 0 && (
            <div className="text-center py-8 text-light-text/40 dark:text-dark-text/40">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No data yet</p>
              <p className="text-xs mt-1">
                Start chatting to see your health behavior insights
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BehaviorInsights;
