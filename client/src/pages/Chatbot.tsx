import React, { useState, useRef, useEffect } from "react";
import { Send, Plus, X, Loader2, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { api } from "../api/api";
import MessageList from "../components/MessageComponent";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Symptom {
  id: string;
  text: string;
}

const MedicalChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const symptomInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    setSymptoms((prev) => prev.filter((symptom) => symptom.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addSymptom();
    }
  };

  const sendMessage = async () => {
    const symptomsText =
      symptoms.length > 0
        ? `I have the following symptoms: ${symptoms
            .map((s) => s.text)
            .join(", ")}. `
        : "";

    const fullMessage = `${symptomsText}${additionalMessage}`.trim();

    if (!fullMessage) return;

    const newMessage: Message = { role: "user", content: fullMessage };
    setMessages((prev) => [...prev, newMessage]);
    setSymptoms([]);
    setAdditionalMessage("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/chat/chat", {
        message: fullMessage,
        context: messages,
      });

      if (data.message) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] md:h-[93vh] max-w-3xl mx-auto md:p-4 -mt-5">
      <Card className="flex-grow flex flex-col h-full overflow-hidden  md:border md:dark:border-secondary/50 shadow-xl rounded-none md:rounded-xl">
        <CardHeader className="shrink-0 px-6 py-4 relative">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
          <CardTitle className="text-3xl text-center font-samarkan text-secondary">
              Umeed
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col gap-4 p-0 overflow-hidden">
          {messages.length === 0 && (
            <div className="text-center space-y-6 text-light-text/90 dark:text-gray-400 p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-secondary/70" />
              </div>
              <p className="text-base font-medium">
                Welcome to Umeed - Your Health Assistant
              </p>
              <div className="max-w-md mx-auto space-y-2 text-sm">
                <p>
                  Add your symptoms using the input field below, or type your
                  health-related questions directly.
                </p>
                <p className="text-sm opacity-80">
                  Umeed will try to provide relevant information and guidance.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex-grow overflow-y-auto px-4">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
            />
          </div>

          <div className="space-y-4 p-6 border-t dark:border-gray-800 bg-gradient-to-t from-background/80 to-transparent dark:from-gray-950/80">
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {symptoms.map((symptom) => (
                <div
                  key={symptom.id}
                  className="flex items-center gap-2 bg-primary px-3 py-1 rounded-full text-white"
                >
                  <span>{symptom.text}</span>
                  <button
                    onClick={() => removeSymptom(symptom.id)}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Input
                ref={symptomInputRef}
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a symptom..."
                className="flex-grow bg-background/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-secondary/30 transition-shadow"
              />
              <Button
                onClick={addSymptom}
                variant="outline"
                size="icon"
                disabled={!currentSymptom.trim()}
                className="bg-secondary/90 hover:bg-secondary dark:hover:bg-secondary dark:bg-secondary/90 text-secondary-foreground border-0 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-3">
              <Input
                value={additionalMessage}
                onChange={(e) => setAdditionalMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && sendMessage()}
                placeholder="Additional details or questions... (optional)"
                className="flex-grow bg-background/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-secondary/30 transition-shadow"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || (!symptoms.length && !additionalMessage.trim())}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border-0 shadow-sm px-6 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalChatbot;