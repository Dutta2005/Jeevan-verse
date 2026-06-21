import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Plus,
  X,
  Loader2,
  MessageSquare,
  Bot,
  Sparkles,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { api } from "../api/api";
import MessageList from "../components/MessageComponent";
import SessionSidebar from "../components/chatbot/SessionSidebar";
import FileUpload from "../components/chatbot/FileUpload";
import BehaviorInsights from "../components/chatbot/BehaviorInsights";

interface Attachment {
  type: "image" | "pdf";
  url: string;
  originalName?: string;
  analysis?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  timestamp?: string;
}

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

interface Symptom {
  id: string;
  text: string;
}

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

const MedicalChatbot: React.FC = () => {
  // Session state
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Behavior insights
  const [showInsights, setShowInsights] = useState(false);
  const [behaviorData, setBehaviorData] = useState<BehaviorData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const symptomInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // ── Load sessions on mount ──
  useEffect(() => {
    loadSessions();
  }, []);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── API Calls ──
  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const { data } = await api.get("/chat/sessions");
      setSessions(data.data || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/chat/sessions/${sessionId}`);
      setMessages(data.data?.messages || []);
      setActiveSessionId(sessionId);
      setMobileSidebarOpen(false);
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async () => {
    try {
      setSessionsLoading(true);
      const { data } = await api.post("/chat/sessions");
      const newSession = data.data;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession._id);
      setMessages([]);
      setMobileSidebarOpen(false);
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  // ── Symptom management ──
  const addSymptom = () => {
    if (currentSymptom.trim()) {
      setSymptoms((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          text: currentSymptom.trim(),
        },
      ]);
      setCurrentSymptom("");
      symptomInputRef.current?.focus();
    }
  };

  const removeSymptom = (id: string) => {
    setSymptoms((prev) => prev.filter((s) => s.id !== id));
  };

  // ── Send message ──
  const sendMessage = async () => {
    // Handle file upload if a file is selected
    if (selectedFile && activeSessionId) {
      await uploadFile();
      return;
    }

    const symptomsText =
      symptoms.length > 0
        ? `I have the following symptoms: ${symptoms
            .map((s) => s.text)
            .join(", ")}. `
        : "";

    const fullMessage = `${symptomsText}${messageInput}`.trim();
    if (!fullMessage || !activeSessionId) return;

    const userMsg: Message = {
      role: "user",
      content: fullMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSymptoms([]);
    setMessageInput("");
    setIsLoading(true);

    try {
      const { data } = await api.post(
        `/chat/sessions/${activeSessionId}/message`,
        { message: fullMessage }
      );

      if (data.data?.assistantMessage) {
        setMessages((prev) => [...prev, data.data.assistantMessage]);
      }

      // Update session title in sidebar
      if (data.data?.sessionTitle) {
        setSessions((prev) =>
          prev.map((s) =>
            s._id === activeSessionId
              ? {
                  ...s,
                  title: data.data.sessionTitle,
                  metadata: {
                    ...s.metadata,
                    messageCount: (s.metadata?.messageCount || 0) + 2,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : s
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── File upload ──
  const uploadFile = async () => {
    if (!selectedFile || !activeSessionId) return;

    setIsUploading(true);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("prescription", selectedFile);

    try {
      const { data } = await api.post(
        `/chat/sessions/${activeSessionId}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data.data?.userMessage) {
        setMessages((prev) => [...prev, data.data.userMessage]);
      }
      if (data.data?.assistantMessage) {
        setMessages((prev) => [...prev, data.data.assistantMessage]);
      }

      // Update sidebar
      if (data.data?.sessionTitle) {
        setSessions((prev) =>
          prev.map((s) =>
            s._id === activeSessionId
              ? {
                  ...s,
                  title: data.data.sessionTitle,
                  metadata: {
                    ...s.metadata,
                    messageCount: (s.metadata?.messageCount || 0) + 2,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : s
          )
        );
      }

      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I had trouble analyzing the prescription. Please try again with a clearer image or PDF.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  // ── Behavior insights ──
  const openInsights = async () => {
    setShowInsights(true);
    setInsightsLoading(true);
    try {
      const { data } = await api.get("/chat/behavior");
      setBehaviorData(data.data);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const canSend =
    activeSessionId &&
    !isLoading &&
    (symptoms.length > 0 || messageInput.trim() || selectedFile);

  return (
    <div className="flex h-[90vh] md:h-[93vh] max-w-6xl mx-auto md:p-4 -mt-5">
      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <div
        className={`
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        fixed md:relative z-50 md:z-auto
        h-full
        transition-transform duration-300 ease-in-out
        ${sidebarCollapsed ? "w-4 md:w-4" : "w-72 md:w-72"}
        bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-xl
        md:bg-white/50 md:dark:bg-gray-900/50
        md:rounded-l-xl
        border-r border-gray-200/50 dark:border-gray-800/50
        relative flex-shrink-0
      `}
      >
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={loadSession}
          onCreateSession={createSession}
          onDeleteSession={deleteSession}
          onOpenInsights={openInsights}
          isLoading={sessionsLoading}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-grow flex flex-col h-full overflow-hidden bg-white/50 dark:bg-gray-900/50 md:rounded-r-xl border border-gray-200/50 dark:border-gray-800/50 md:border-l-0 shadow-xl">
        {/* Header */}
        <div className="shrink-0 px-4 md:px-6 py-3 relative border-b border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                className="md:hidden p-1.5 rounded-lg hover:bg-secondary/10 text-light-text/60 dark:text-dark-text/60"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-samarkan text-secondary leading-tight">
                    Umeed
                  </h1>
                  <p className="text-[10px] text-light-text/40 dark:text-dark-text/40 -mt-0.5">
                    AI Health Assistant
                  </p>
                </div>
              </div>
            </div>

            {activeSessionId && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-light-text/40 dark:text-dark-text/40">
                  RAG Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto px-4">
          {!activeSessionId ? (
            /* Empty state — no session selected */
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 p-8 max-w-md">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-10 h-10 text-secondary/70" />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                    Welcome to Umeed
                  </h2>
                  <p className="text-sm text-light-text/60 dark:text-dark-text/60 leading-relaxed">
                    Your AI-powered health assistant with memory. I remember
                    your past conversations, prescriptions, and health profile
                    to give you personalized advice.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Button
                    onClick={createSession}
                    disabled={sessionsLoading}
                    className="bg-gradient-to-r from-secondary to-accent text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 px-6 py-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Conversation
                  </Button>

                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    {[
                      "💊 Upload Prescription",
                      "🩺 Symptom Analysis",
                      "📊 Health Insights",
                      "💬 Ask About Medications",
                    ].map((feature, i) => (
                      <motion.span
                        key={feature}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary/10 text-secondary/70 border border-secondary/15"
                      >
                        {feature}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          ) : messages.length === 0 && !isLoading ? (
            /* Empty session */
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-secondary/50" />
                </div>
                <div>
                  <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/70">
                    Start your conversation
                  </p>
                  <p className="text-xs text-light-text/40 dark:text-dark-text/40 mt-1">
                    Add symptoms, ask questions, or upload a prescription
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        {/* ── Input Area ── */}
        {activeSessionId && (
          <div className="space-y-3 p-4 md:p-6 border-t border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-t from-white/90 to-transparent dark:from-gray-900/90">
            {/* Symptom tags */}
            <AnimatePresence>
              {symptoms.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {symptoms.map((symptom) => (
                    <motion.div
                      key={symptom.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary/80 px-3 py-1 rounded-full text-white text-sm shadow-sm"
                    >
                      <span>{symptom.text}</span>
                      <button
                        onClick={() => removeSymptom(symptom.id)}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Symptom input row */}
            <div className="flex gap-2">
              <Input
                ref={symptomInputRef}
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSymptom()}
                placeholder="Add a symptom..."
                className="flex-grow bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 focus-visible:ring-1 focus-visible:ring-secondary/40 text-sm rounded-xl"
              />
              <Button
                onClick={addSymptom}
                variant="outline"
                size="icon"
                disabled={!currentSymptom.trim()}
                className="bg-secondary/90 hover:bg-secondary dark:hover:bg-secondary dark:bg-secondary/90 text-white border-0 shadow-sm rounded-xl flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Message input row */}
            <div className="flex items-center gap-2">
              <FileUpload
                onFileSelect={handleFileSelect}
                isUploading={isUploading}
                selectedFile={selectedFile}
                onClearFile={() => setSelectedFile(null)}
              />

              <Input
                ref={messageInputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && !isLoading && sendMessage()
                }
                placeholder={
                  selectedFile
                    ? "Upload prescription to analyze..."
                    : "Ask about health, medications, symptoms..."
                }
                disabled={isLoading}
                className="flex-grow bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 focus-visible:ring-1 focus-visible:ring-secondary/40 text-sm rounded-xl"
              />

              <Button
                onClick={sendMessage}
                disabled={!canSend}
                className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white border-0 shadow-md px-5 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Behavior Insights Modal ── */}
      <AnimatePresence>
        {showInsights && (
          <BehaviorInsights
            data={behaviorData}
            isLoading={insightsLoading}
            onClose={() => setShowInsights(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicalChatbot;