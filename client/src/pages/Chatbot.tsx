import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import MessageList from "@/components/MessageComponent";
import BehaviorInsights from "@/components/chatbot/BehaviorInsights";
import ChatComposer from "@/components/chatbot/ChatComposer";
import { useUmeed } from "@/components/chatbot/umeed-context";
import { cn } from "@/lib/utils";
import styles from "@/components/chatbot/Umeed.module.css";

const starterPrompts = [
  {
    label: "Prepare for a visit",
    prompt: "Help me prepare questions to ask at my next medical appointment.",
  },
  {
    label: "Understand a prescription",
    prompt:
      "What information should I look for on a prescription, and what should I ask my pharmacist?",
  },
  {
    label: "Build a sleep routine",
    prompt: "What general habits can support a consistent sleep routine?",
  },
];

export default function MedicalChatbot() {
  const chat = useUmeed();
  const showWelcome = chat.messages.length === 0 && !chat.isLoading;
  const activeSession = chat.sessions.find((session) => session._id === chat.activeSessionId);
  return (
    <section
      className={cn(styles.chat, showWelcome && styles.welcomeChat)}
      aria-label="Umeed conversation"
    >
      {chat.error && (
        <div className={styles.error}>
          <Alert variant="destructive">
            <AlertDescription>{chat.error}</AlertDescription>
            <Button variant="ghost" onClick={() => chat.setError(null)}>
              Dismiss
            </Button>
          </Alert>
        </div>
      )}
      {chat.activeSessionId && !showWelcome && (
        <header className={styles.conversationHeader}>
          <h1 title={activeSession?.title}>{activeSession?.title || "New chat"}</h1>
        </header>
      )}
      <div className={styles.conversation}>
        {showWelcome ? (
          <div className={styles.start}>
            <Empty className="w-full gap-5 p-0">
              <EmptyHeader>
                <EmptyTitle>
                  <h1>Ask a health question</h1>
                </EmptyTitle>
              </EmptyHeader>
              <div className={styles.suggestions} aria-label="Suggested prompts">
                {starterPrompts.map(({ label, prompt }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="ghost"
                    disabled={chat.sessionsLoading || chat.isLoading}
                    onClick={() => {
                      chat.setMessageInput(prompt);
                      chat.messageInputRef.current?.focus();
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Empty>
          </div>
        ) : (
          <MessageList
            key={chat.activeSessionId || "new"}
            messages={chat.messages}
            isLoading={chat.isLoading}
          />
        )}
      </div>
      <ChatComposer />
      <p className={styles.safety}>
        Umeed can make mistakes. For medical advice, speak with a qualified clinician. For urgent
        symptoms, contact local emergency services.
      </p>
      {chat.showInsights && (
        <BehaviorInsights
          data={chat.behaviorData}
          isLoading={chat.insightsLoading}
          onClose={() => chat.setShowInsights(false)}
        />
      )}
    </section>
  );
}
