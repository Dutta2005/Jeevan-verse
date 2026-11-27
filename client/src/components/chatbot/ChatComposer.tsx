import { useState } from "react";
import { ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import FileUpload from "./FileUpload";
import { useUmeed } from "./umeed-context";
import styles from "./Umeed.module.css";

export default function ChatComposer() {
  const { messageInputRef, symptomInputRef, ...chat } = useUmeed();
  const [symptomsOpen, setSymptomsOpen] = useState(false);
  const busy = chat.isLoading || chat.sessionsLoading;
  return (
    <form
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault();
        if (chat.canSend) void chat.sendMessage();
      }}
    >
      <Collapsible open={symptomsOpen} onOpenChange={setSymptomsOpen}>
        <FieldGroup>
          <Field data-disabled={busy}>
            <FieldLabel className="sr-only" htmlFor="umeed-message">
              Message Umeed
            </FieldLabel>
            <InputGroup className={styles.promptPanel}>
              <InputGroupTextarea
                id="umeed-message"
                ref={messageInputRef}
                value={chat.messageInput}
                onChange={(event) => chat.setMessageInput(event.target.value)}
                disabled={busy}
                rows={3}
                className={styles.promptTextarea}
                aria-describedby="umeed-composer-help"
                placeholder={
                  chat.selectedFile ? "Upload prescription to analyze..." : "Write your question"
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    !window.matchMedia?.("(pointer: coarse)").matches
                  ) {
                    event.preventDefault();
                    if (chat.canSend) void chat.sendMessage();
                  }
                }}
              />
              {symptomsOpen && (
                <InputGroupAddon align="block-start" className="w-full">
                  <CollapsibleContent className="w-full">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="symptom-note">Symptom notes</FieldLabel>
                        <div className="flex min-w-0 items-center gap-2">
                          <Input
                            id="symptom-note"
                            ref={symptomInputRef}
                            value={chat.currentSymptom}
                            onChange={(event) => chat.setCurrentSymptom(event.target.value)}
                            disabled={busy}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                                event.preventDefault();
                                chat.addSymptom();
                              }
                            }}
                            placeholder="Add a symptom..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Add symptom"
                            onClick={chat.addSymptom}
                            disabled={!chat.currentSymptom.trim() || busy}
                          >
                            <Plus aria-hidden="true" />
                          </Button>
                        </div>
                      </Field>
                    </FieldGroup>
                    {chat.symptoms.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {chat.symptoms.map((symptom) => (
                          <Badge
                            key={symptom.id}
                            variant="secondary"
                            className="max-w-full gap-1 whitespace-normal"
                          >
                            <span className="break-all">{symptom.text}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove ${symptom.text}`}
                              onClick={() => chat.removeSymptom(symptom.id)}
                              disabled={busy}
                            >
                              <X aria-hidden="true" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </InputGroupAddon>
              )}
              <InputGroupAddon align="block-end" className="flex-wrap gap-2">
                <FileUpload
                  onFileSelect={chat.handleFileSelect}
                  isUploading={chat.isUploading || busy}
                  selectedFile={chat.selectedFile}
                  onClearFile={() => chat.setSelectedFile(null)}
                />
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="ghost" disabled={busy}>
                    {symptomsOpen ? "Hide symptoms" : "Add symptoms"}
                    {chat.symptoms.length > 0 && ` (${chat.symptoms.length})`}
                  </Button>
                </CollapsibleTrigger>
                <div className="ml-auto flex items-center gap-3">
                  <span id="umeed-composer-help" className={styles.composerHint}>
                    Shift + Enter for a new line
                  </span>
                  <Button
                    type="submit"
                    size="icon"
                    aria-label={
                      chat.isUploading
                        ? "Uploading prescription"
                        : chat.isLoading
                          ? "Waiting for Umeed"
                          : "Send message"
                    }
                    disabled={!chat.canSend}
                  >
                    <ArrowUp aria-hidden="true" />
                  </Button>
                </div>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
      </Collapsible>
      {chat.selectedFile && (
        <p className={styles.uploadNote}>
          Uploads may contain sensitive health information. Share only what you want analyzed.
        </p>
      )}
    </form>
  );
}
