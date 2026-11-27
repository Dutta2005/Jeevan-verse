// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Chatbot from "../Chatbot";
import { UmeedProvider } from "../../components/chatbot/UmeedWorkspace";
import { useUmeed } from "../../components/chatbot/umeed-context";
import type MessageList from "../../components/MessageComponent";
import type FileUpload from "../../components/chatbot/FileUpload";
import type BehaviorInsights from "../../components/chatbot/BehaviorInsights";

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock("../../api/api", () => ({ api: mocks }));
// Child behavior has its own suites; these adapters expose the page's state and callbacks.
function ChatTestHistory() {
  const chat = useUmeed();
  return (
    <aside>
      <button onClick={() => void chat.createSession()} disabled={chat.sessionsLoading}>
        Create session
      </button>
      <button onClick={() => void chat.openInsights()}>Open insights</button>
      {chat.sessions.map((session) => (
        <div key={session._id}>
          <button onClick={() => void chat.loadSession(session._id)}>{session.title}</button>
          <button onClick={() => void chat.deleteSession(session._id)}>
            Delete {session.title}
          </button>
          <span>{session.metadata?.messageCount || 0} messages</span>
        </div>
      ))}
    </aside>
  );
}
function renderChat() {
  return render(
    <UmeedProvider>
      <ChatTestHistory />
      <Chatbot />
    </UmeedProvider>,
  );
}
vi.mock("../../components/MessageComponent", () => ({
  default: ({ messages, isLoading }: ComponentProps<typeof MessageList>) => (
    <div>
      {messages.map((m, i) => (
        <p key={i}>{m.content}</p>
      ))}
      {isLoading && <p>Waiting for response</p>}
    </div>
  ),
}));
vi.mock("../../components/chatbot/FileUpload", () => ({
  default: (props: ComponentProps<typeof FileUpload>) => (
    <div>
      <input
        aria-label="Prescription file"
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) props.onFileSelect(file);
        }}
      />
      {props.selectedFile && (
        <button type="button" onClick={props.onClearFile}>
          Clear {props.selectedFile.name}
        </button>
      )}
      {props.isUploading && <p>Uploading file</p>}
    </div>
  ),
}));
vi.mock("../../components/chatbot/BehaviorInsights", () => ({
  default: (props: ComponentProps<typeof BehaviorInsights>) => (
    <div>
      <p>{props.isLoading ? "Loading insights" : props.data ? "Insights loaded" : "No insights"}</p>
      <button onClick={props.onClose}>Close insights</button>
    </div>
  ),
}));

const session = {
  _id: "s1",
  title: "Existing conversation",
  metadata: { messageCount: 2, mood: "neutral", topics: [] },
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};
const mount = async () => {
  renderChat();
  await screen.findByRole("button", { name: session.title });
};
const select = async () => {
  await mount();
  await userEvent.click(screen.getByRole("button", { name: session.title }));
  await screen.findByPlaceholderText("Write your question");
  await waitFor(() => expect(screen.getByLabelText("Message Umeed")).toBeEnabled());
  await userEvent.click(screen.getByRole("button", { name: "Add symptoms" }));
};
const send = async (message = "Synthetic question") => {
  fireEvent.change(screen.getByPlaceholderText("Write your question"), {
    target: { value: message },
  });
  fireEvent.keyDown(screen.getByPlaceholderText("Write your question"), {
    key: "Enter",
  });
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.get.mockImplementation((url: string) =>
    Promise.resolve({
      data: {
        data:
          url === "/chat/sessions"
            ? [session, { ...session, _id: "s2", title: "Other conversation" }]
            : url === "/chat/behavior"
              ? { totalSessions: 2 }
              : { messages: [] },
      },
    }),
  );
  mocks.post.mockResolvedValue({ data: { data: {} } });
  mocks.delete.mockResolvedValue({});
});
afterEach(() => vi.restoreAllMocks());

describe("chat session workflows", () => {
  it("restores the first message if creating its conversation fails", async () => {
    await mount();
    mocks.post.mockRejectedValueOnce(new Error("Could not start chat"));
    await send("First question");
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not start chat");
    expect(screen.getByLabelText("Message Umeed")).toHaveValue("First question");
  });
  it("opens a saved conversation through shared sidebar state", async () => {
    await select();
    expect(mocks.get).toHaveBeenCalledWith("/chat/sessions/s1");
    expect(screen.getByText("Ask a health question")).toBeInTheDocument();
  });
  it("creates a conversation from the welcome screen", async () => {
    mocks.post.mockResolvedValue({
      data: { data: { ...session, _id: "new", title: "New conversation" } },
    });
    await mount();
    await userEvent.click(screen.getByRole("button", { name: "Create session" }));
    expect(await screen.findByText("Ask a health question")).toBeInTheDocument();
    expect(mocks.post).toHaveBeenCalledWith("/chat/sessions");
    expect(screen.getByRole("button", { name: "New conversation" })).toBeInTheDocument();
  });
  it.each(["list", "create", "load"])("recovers from a session %s failure", async (operation) => {
    if (operation === "list") {
      mocks.get.mockRejectedValue(new Error("Offline"));
      renderChat();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Create session" })).toBeEnabled(),
      );
    } else {
      await mount();
      if (operation === "create") {
        mocks.post.mockRejectedValue(new Error("Offline"));
        await userEvent.click(screen.getByRole("button", { name: "Create session" }));
      } else {
        mocks.get.mockRejectedValue(new Error("Offline"));
        await userEvent.click(screen.getByRole("button", { name: session.title }));
      }
      expect(screen.getByText("Ask a health question")).toBeInTheDocument();
    }
    expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
  });
  it.each([true, false])("deletes a conversation (active: %s)", async (active) => {
    if (active) await select();
    else await mount();
    await userEvent.click(screen.getByRole("button", { name: `Delete ${session.title}` }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: session.title })).not.toBeInTheDocument(),
    );
    expect(mocks.delete).toHaveBeenCalledWith("/chat/sessions/s1");
    expect(screen.getByText("Ask a health question")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Other conversation" })).toBeInTheDocument();
  });
  it("keeps a session after deletion fails", async () => {
    mocks.delete.mockRejectedValue(new Error("Offline"));
    await mount();
    await userEvent.click(screen.getByRole("button", { name: `Delete ${session.title}` }));
    expect(screen.getByRole("button", { name: session.title })).toBeInTheDocument();
  });
  it("loads a session's saved messages and handles missing messages", async () => {
    await mount();
    mocks.get.mockResolvedValueOnce({
      data: { data: { messages: [{ role: "assistant", content: "Saved response" }] } },
    });
    await userEvent.click(screen.getByRole("button", { name: session.title }));
    expect(await screen.findByText("Saved response")).toBeInTheDocument();
    mocks.get.mockResolvedValueOnce({ data: {} });
    await userEvent.click(screen.getByRole("button", { name: "Other conversation" }));
    expect(await screen.findByText("Ask a health question")).toBeInTheDocument();
  });
  it("handles an empty sessions response", async () => {
    mocks.get.mockResolvedValue({ data: {} });
    renderChat();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Create session" })).toBeEnabled(),
    );
    expect(screen.getByText("Ask a health question")).toBeInTheDocument();
  });
});

describe("chat messages and prescriptions", () => {
  it("dismisses a failed request before trying again", async () => {
    mocks.get.mockRejectedValueOnce(new Error("Offline"));
    renderChat();
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("inserts a starter draft without sending it", async () => {
    await mount();
    await userEvent.click(screen.getByRole("button", { name: "Prepare for a visit" }));
    expect(screen.getByLabelText("Message Umeed")).toHaveValue(
      "Help me prepare questions to ask at my next medical appointment.",
    );
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("creates a session on the first send and posts the draft to that session", async () => {
    await mount();
    mocks.post
      .mockResolvedValueOnce({ data: { data: { ...session, _id: "new-chat" } } })
      .mockResolvedValueOnce({
        data: { data: { assistantMessage: { role: "assistant", content: "Synthetic answer" } } },
      });
    fireEvent.change(screen.getByLabelText("Message Umeed"), {
      target: { value: "First line\nSecond line" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Synthetic answer")).toBeInTheDocument();
    expect(mocks.post).toHaveBeenNthCalledWith(1, "/chat/sessions");
    expect(mocks.post).toHaveBeenNthCalledWith(2, "/chat/sessions/new-chat/message", {
      message: "First line\nSecond line",
    });
  });
  it("sends symptoms and a message together, displays the response, and updates the sidebar", async () => {
    await select();
    fireEvent.change(screen.getByPlaceholderText("Add a symptom..."), {
      target: { value: "Synthetic symptom" },
    });
    fireEvent.keyDown(screen.getByPlaceholderText("Add a symptom..."), { key: "Enter" });
    mocks.post.mockResolvedValue({
      data: {
        data: {
          assistantMessage: { role: "assistant", content: "Synthetic answer" },
          sessionTitle: "Updated conversation",
        },
      },
    });
    await send();
    expect(await screen.findByText("Synthetic answer")).toBeInTheDocument();
    expect(mocks.post).toHaveBeenCalledWith("/chat/sessions/s1/message", {
      message: "I have the following symptoms: Synthetic symptom. Synthetic question",
    });
    expect(screen.getByRole("button", { name: "Updated conversation" })).toBeInTheDocument();
    expect(screen.getByText("4 messages")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Synthetic symptom")).not.toBeInTheDocument());
  });
  it("removes a symptom without sending and ignores blank or shift-enter messages", async () => {
    await select();
    const input = screen.getByPlaceholderText("Add a symptom...");
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "Test symptom" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(screen.getByText("Test symptom").parentElement!.querySelector("button")!);
    await waitFor(() => expect(screen.queryByText("Test symptom")).not.toBeInTheDocument());
    await send(" ");
    fireEvent.keyDown(screen.getByPlaceholderText("Write your question"), {
      key: "Enter",
      shiftKey: true,
    });
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("provides recovery guidance after a message failure", async () => {
    await select();
    mocks.post.mockRejectedValue(new Error("Offline"));
    await send();
    expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
    expect(screen.getByLabelText("Message Umeed")).toHaveValue("Synthetic question");
    expect(screen.getByPlaceholderText("Write your question")).toBeEnabled();
  });
  it("handles a response without an assistant message or title", async () => {
    await select();
    await send();
    expect(await screen.findByText("Synthetic question")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByPlaceholderText("Write your question")).toBeEnabled());
  });
  it.each(["success", "empty", "error"])("handles prescription upload %s", async (result) => {
    await select();
    const file = new File(["synthetic"], "test.pdf", { type: "application/pdf" });
    await userEvent.upload(screen.getByLabelText("Prescription file"), file);
    if (result === "error") mocks.post.mockRejectedValue(new Error("Offline"));
    else
      mocks.post.mockResolvedValue({
        data: {
          data:
            result === "empty"
              ? {}
              : {
                  userMessage: { role: "user", content: "Uploaded prescription" },
                  assistantMessage: { role: "assistant", content: "Synthetic analysis" },
                  sessionTitle: "Prescription conversation",
                },
        },
      });
    fireEvent.keyDown(screen.getByPlaceholderText("Upload prescription to analyze..."), {
      key: "Enter",
    });
    await waitFor(() =>
      expect(mocks.post).toHaveBeenCalledWith("/chat/sessions/s1/upload", expect.any(FormData), {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
    expect((mocks.post.mock.calls[0]![1] as FormData).get("prescription")).toBe(file);
    if (result === "success") {
      expect(await screen.findByText("Synthetic analysis")).toBeInTheDocument();
      expect(screen.getByText("Uploaded prescription")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Prescription conversation" })).toBeInTheDocument();
    } else if (result === "error") {
      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Clear test.pdf" })).toBeInTheDocument();
    }
    if (result !== "error")
      await waitFor(() =>
        expect(screen.queryByRole("button", { name: "Clear test.pdf" })).not.toBeInTheDocument(),
      );
  });
  it("clears a selected file before sending", async () => {
    await select();
    await userEvent.upload(
      screen.getByLabelText("Prescription file"),
      new File(["test"], "test.pdf", { type: "application/pdf" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Clear test.pdf" }));
    expect(screen.getByPlaceholderText("Write your question")).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it.each([true, false])("loads insights and closes them (success: %s)", async (success) => {
    await mount();
    if (!success) mocks.get.mockRejectedValue(new Error("Offline"));
    await userEvent.click(screen.getByRole("button", { name: "Open insights" }));
    expect(
      await screen.findByText(success ? "Insights loaded" : "No insights"),
    ).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith("/chat/behavior");
    await userEvent.click(screen.getByRole("button", { name: "Close insights" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Close insights" })).not.toBeInTheDocument(),
    );
  });
});
