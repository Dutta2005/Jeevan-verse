import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "@/api/api";
import { getErrorMessage } from "@/lib/error";

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

export interface SessionItem {
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

export function useChatController() {
  // Session state
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);

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
  const symptomInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const [error, setError] = useState<string | null>(null);

  // ── Load sessions on mount ──
  useEffect(() => {
    let active = true;
    const loadSessions = async () => {
      try {
        setSessionsLoading(true);
        const { data } = await api.get("/chat/sessions");
        if (active) setSessions(data.data || []);
      } catch (error) {
        if (active) setError(getErrorMessage(error, "Could not load chats. Please try again."));
      } finally {
        if (active) setSessionsLoading(false);
      }
    };

    void loadSessions();
    return () => {
      active = false;
    };
  }, []);

  // ── API Calls ──

  const loadSession = async (sessionId: string) => {
    if (isLoading || isUploading || sessionsLoading) return;
    setError(null);
    try {
      setIsLoading(true);
      const { data } = await api.get(`/chat/sessions/${sessionId}`);
      setMessages(data.data?.messages || []);
      setActiveSessionId(sessionId);
      setSymptoms([]);
      setCurrentSymptom("");
      setMessageInput("");
      setSelectedFile(null);
    } catch (error) {
      setError(getErrorMessage(error, "Could not open this chat. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const requestNewSession = async () => {
    const { data } = await api.post("/chat/sessions");
    const session = data.data as SessionItem | undefined;
    if (!session?._id) throw new Error("A new chat could not be created. Please try again.");
    setSessions((previous) => [session, ...previous]);
    setActiveSessionId(session._id);
    return session._id;
  };

  const createSession = async () => {
    if (isLoading || isUploading || sessionsLoading) return;
    setError(null);
    try {
      setSessionsLoading(true);
      await requestNewSession();
      setMessages([]);
      setSymptoms([]);
      setCurrentSymptom("");
      setMessageInput("");
      setSelectedFile(null);
    } catch (error) {
      setError(getErrorMessage(error, "Could not create a chat. Please try again."));
    } finally {
      setSessionsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (isLoading || isUploading || sessionsLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
        setSymptoms([]);
        setMessageInput("");
        setSelectedFile(null);
      }
    } catch (error) {
      setError(getErrorMessage(error, "Could not delete this chat. Please try again."));
    } finally {
      setIsLoading(false);
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
    if (isLoading || isUploading || sessionsLoading) return;
    setError(null);
    const symptomsText =
      symptoms.length > 0
        ? `I have the following symptoms: ${symptoms.map((s) => s.text).join(", ")}. `
        : "";

    const fullMessage = `${symptomsText}${messageInput}`.trim();
    if (!fullMessage && !selectedFile) return;
    setIsLoading(true);
    let sessionId = activeSessionId;
    try {
      sessionId ??= await requestNewSession();
    } catch (error) {
      setError(getErrorMessage(error, "Could not create a chat. Please try again."));
      setIsLoading(false);
      return;
    }
    if (selectedFile) {
      await uploadFile(sessionId);
      return;
    }

    const userMsg: Message = {
      role: "user",
      content: fullMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSymptoms([]);
    setMessageInput("");

    try {
      const { data } = await api.post(`/chat/sessions/${sessionId}/message`, {
        message: fullMessage,
      });

      if (data.data?.assistantMessage) {
        setMessages((prev) => [...prev, data.data.assistantMessage]);
      }

      // Update session title in sidebar
      if (data.data?.sessionTitle) {
        setSessions((prev) =>
          prev.map((s) =>
            s._id === sessionId
              ? {
                  ...s,
                  title: data.data.sessionTitle,
                  metadata: {
                    ...s.metadata,
                    messageCount: (s.metadata?.messageCount || 0) + 2,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : s,
          ),
        );
      }
    } catch (error) {
      setError(getErrorMessage(error, "Your message could not be sent. Please try again."));
      setMessages((prev) => prev.filter((message) => message !== userMsg));
      setMessageInput(messageInput);
      setSymptoms(symptoms);
    } finally {
      setIsLoading(false);
    }
  };

  // ── File upload ──
  const uploadFile = async (sessionId: string) => {
    if (!selectedFile) return;

    setIsUploading(true);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("prescription", selectedFile);

    try {
      const { data } = await api.post(`/chat/sessions/${sessionId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
            s._id === sessionId
              ? {
                  ...s,
                  title: data.data.sessionTitle,
                  metadata: {
                    ...s.metadata,
                    messageCount: (s.metadata?.messageCount || 0) + 2,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : s,
          ),
        );
      }

      setSelectedFile(null);
    } catch (error) {
      setError(getErrorMessage(error, "The prescription could not be uploaded. Please try again."));
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
      setError(getErrorMessage(error, "Could not load insights. Please try again."));
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const canSend =
    !isLoading &&
    !isUploading &&
    !sessionsLoading &&
    (symptoms.length > 0 || messageInput.trim() || selectedFile);

  return {
    sessions,
    activeSessionId,
    sessionsLoading,
    messages,
    symptoms,
    currentSymptom,
    setCurrentSymptom,
    messageInput,
    setMessageInput,
    isLoading,
    selectedFile,
    setSelectedFile,
    isUploading,
    showInsights,
    setShowInsights,
    behaviorData,
    insightsLoading,
    symptomInputRef,
    messageInputRef,
    loadSession,
    createSession,
    deleteSession,
    addSymptom,
    removeSymptom,
    sendMessage,
    openInsights,
    handleFileSelect,
    canSend,
    error,
    setError,
  };
}
