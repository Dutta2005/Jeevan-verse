import type { RefObject } from "react";
import ReactMarkdown from "react-markdown";
import { Message, MessageContent, MessageHeader, MessageFooter } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { AttachmentPreview, PrescriptionAnalysisBlock } from "./chatbot/ChatAttachments";
import styles from "./chatbot/Umeed.module.css";

interface Attachment {
  type: "image" | "pdf";
  url: string;
  originalName?: string;
  analysis?: string;
}
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  timestamp?: string;
}
interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef?: RefObject<HTMLDivElement | null>;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <MessageScrollerProvider>
      <MessageScroller>
        <MessageScrollerViewport aria-label="Conversation messages">
          <MessageScrollerContent className={styles.messages}>
            {messages.map((message, index) => (
              <MessageScrollerItem
                key={index}
                scrollAnchor={message.role === "user" && index === messages.length - 1}
              >
                <Message align={message.role === "user" ? "end" : "start"}>
                  <MessageContent>
                    <MessageHeader>{message.role === "user" ? "You" : "Umeed"}</MessageHeader>
                    {message.attachments?.map((attachment, key) => (
                      <AttachmentPreview key={key} attachment={attachment} />
                    ))}
                    {message.role === "assistant" &&
                      messages[index - 1]?.attachments
                        ?.filter((attachment) => attachment.analysis)
                        .map((attachment, key) => (
                          <PrescriptionAnalysisBlock key={key} attachment={attachment} />
                        ))}
                    <Bubble variant={message.role === "user" ? "muted" : "ghost"}>
                      <BubbleContent>
                        <div className={styles.messageText}>
                          {message.role === "user" ? (
                            <p>{message.content}</p>
                          ) : (
                            <ReactMarkdown
                              components={{
                                a: ({ href, children }) => (
                                  <a href={href} target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </BubbleContent>
                    </Bubble>
                    {message.timestamp && !Number.isNaN(Date.parse(message.timestamp)) && (
                      <MessageFooter>
                        <time dateTime={message.timestamp}>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </MessageFooter>
                    )}
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            ))}
            {isLoading && (
              <MessageScrollerItem>
                <p role="status" className="text-sm text-muted-foreground">
                  Umeed is responding…
                </p>
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
