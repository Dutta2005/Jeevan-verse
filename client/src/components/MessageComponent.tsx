// MessageList.tsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { Bot, User, FileText, ExternalLink } from "lucide-react";
import PrescriptionCard from "./chatbot/PrescriptionCard";

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

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start">
    <div className="flex items-start gap-2.5 max-w-[85%]">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-secondary/60"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  messagesEndRef,
}) => {
  return (
    <div className="flex-grow overflow-y-auto min-h-0">
      <div className="space-y-4 p-2">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index === messages.length - 1 ? 0.1 : 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            {msg.role === "user" ? (
              /* User message */
              <div className="flex items-start gap-2.5 max-w-[85%] flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1.5">
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-1.5">
                      {msg.attachments.map((att, i) => (
                        <AttachmentPreview key={i} attachment={att} />
                      ))}
                    </div>
                  )}

                  <div className="bg-primary text-white rounded-2xl rounded-tr-md p-3 shadow-sm">
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.timestamp && (
                    <p className="text-[10px] text-light-text/40 dark:text-dark-text/40 text-right">
                      {formatTimestamp(msg.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Assistant message */
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1.5">
                  {/* Check for prescription analysis in previous user message */}
                  {index > 0 && messages[index - 1]?.attachments?.some(a => a.analysis) && (
                    <PrescriptionAnalysisBlock
                      attachment={messages[index - 1].attachments!.find(a => a.analysis)!}
                    />
                  )}

                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0 text-sm leading-relaxed text-light-text dark:text-dark-text">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc ml-4 mb-2 text-sm text-light-text dark:text-dark-text">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal ml-4 mb-2 text-sm text-light-text dark:text-dark-text">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-sm font-semibold mb-2 text-secondary">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-medium mb-1.5 text-light-text dark:text-dark-text">
                            {children}
                          </h3>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-secondary/90 dark:text-secondary">
                            {children}
                          </strong>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className="text-secondary hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">
                            {children}
                          </code>
                        ),
                        hr: () => (
                          <hr className="my-3 border-gray-200 dark:border-gray-700" />
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-secondary/30 pl-3 italic text-sm text-light-text/70 dark:text-dark-text/70 my-2">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {msg.timestamp && (
                    <p className="text-[10px] text-light-text/40 dark:text-dark-text/40">
                      {formatTimestamp(msg.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// Attachment preview in user messages
const AttachmentPreview: React.FC<{ attachment: Attachment }> = ({
  attachment,
}) => {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border border-primary/20 bg-primary/5 max-w-[200px] ml-auto">
      {attachment.type === "image" ? (
        <>
          <img
            src={attachment.url}
            alt={attachment.originalName || "Prescription"}
            className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowFull(!showFull)}
          />
          {showFull && (
            <div
              className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
              onClick={() => setShowFull(false)}
            >
              <img
                src={attachment.url}
                alt="Full prescription"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}
        </>
      ) : (
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 hover:bg-primary/10 transition-colors"
        >
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-xs truncate text-light-text dark:text-dark-text">
            {attachment.originalName || "Prescription.pdf"}
          </span>
          <ExternalLink className="w-3 h-3 text-light-text/40 flex-shrink-0" />
        </a>
      )}
    </div>
  );
};

// Prescription analysis block (shown before assistant analysis message)
const PrescriptionAnalysisBlock: React.FC<{ attachment: Attachment }> = ({
  attachment,
}) => {
  try {
    const analysis = JSON.parse(attachment.analysis || "{}");
    if (!analysis.medications && !analysis.diagnosis) return null;
    return (
      <PrescriptionCard
        analysis={analysis}
        imageUrl={attachment.type === "image" ? attachment.url : undefined}
      />
    );
  } catch {
    return null;
  }
};

export default MessageList;