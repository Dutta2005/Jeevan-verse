// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Chatbot from "../Chatbot";
import type SessionSidebar from "../../components/chatbot/SessionSidebar";
import type MessageList from "../../components/MessageComponent";
import type FileUpload from "../../components/chatbot/FileUpload";
import type BehaviorInsights from "../../components/chatbot/BehaviorInsights";

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock("../../api/api", () => ({ api: mocks }));
// Child behavior has its own suites; these adapters expose the page's state and callbacks.
vi.mock("../../components/chatbot/SessionSidebar", () => ({
  default: (props: ComponentProps<typeof SessionSidebar>) => (
    <aside>
      <button onClick={props.onCreateSession} disabled={props.isLoading}>
        Create session
      </button>
      <button onClick={props.onToggleCollapse}>
        {props.isCollapsed ? "Expand sessions" : "Collapse sessions"}
      </button>
      <button onClick={props.onOpenInsights}>Open insights</button>
      {props.sessions.map((s) => (
        <div key={s._id}>
          <button onClick={() => props.onSelectSession(s._id)}>{s.title}</button>
          <button onClick={() => props.onDeleteSession(s._id)}>Delete {s.title}</button>
          <span>{s.metadata?.messageCount || 0} messages</span>
        </div>
      ))}
    </aside>
  ),
}));
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
        <button onClick={props.onClearFile}>Clear {props.selectedFile.name}</button>
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
  render(<Chatbot />);
  await screen.findByRole("button", { name: session.title });
};
const select = async () => {
  await mount();
  await userEvent.click(screen.getByRole("button", { name: session.title }));
  await screen.findByPlaceholderText("Ask about health, medications, symptoms...");
};
const send = async (message = "Synthetic question") => {
  fireEvent.change(screen.getByPlaceholderText("Ask about health, medications, symptoms..."), {
    target: { value: message },
  });
  fireEvent.keyDown(screen.getByPlaceholderText("Ask about health, medications, symptoms..."), {
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
  it("opens and dismisses the mobile session overlay", async () => {
    await mount();
    await userEvent.click(screen.getByRole("button", { name: "" }));
    const overlay = document.querySelector(".fixed.inset-0.z-40");
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay!);
    await waitFor(() =>
      expect(document.querySelector(".fixed.inset-0.z-40")).not.toBeInTheDocument(),
    );
  });
  it("loads sessions, selects a conversation, and toggles sidebar state", async () => {
    await select();
    expect(mocks.get).toHaveBeenCalledWith("/chat/sessions/s1");
    expect(screen.getByText("Start your conversation")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Collapse sessions" }));
    expect(screen.getByRole("button", { name: "Expand sessions" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Expand sessions" }));
  });
  it("creates a conversation from the welcome screen", async () => {
    mocks.post.mockResolvedValue({
      data: { data: { ...session, _id: "new", title: "New conversation" } },
    });
    await mount();
    await userEvent.click(screen.getByRole("button", { name: "Start New Conversation" }));
    expect(await screen.findByText("Start your conversation")).toBeInTheDocument();
    expect(mocks.post).toHaveBeenCalledWith("/chat/sessions");
    expect(screen.getByRole("button", { name: "New conversation" })).toBeInTheDocument();
  });
  it.each(["list", "create", "load"])("recovers from a session %s failure", async (operation) => {
    if (operation === "list") {
      mocks.get.mockRejectedValue(new Error("Offline"));
      render(<Chatbot />);
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Start New Conversation" })).toBeEnabled(),
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
      expect(screen.getByText("Welcome to Umeed")).toBeInTheDocument();
    }
    expect(console.error).toHaveBeenCalled();
  });
  it.each([true, false])("deletes a conversation (active: %s)", async (active) => {
    if (active) await select();
    else await mount();
    await userEvent.click(screen.getByRole("button", { name: `Delete ${session.title}` }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: session.title })).not.toBeInTheDocument(),
    );
    expect(mocks.delete).toHaveBeenCalledWith("/chat/sessions/s1");
    expect(screen.getByText("Welcome to Umeed")).toBeInTheDocument();
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
    expect(await screen.findByText("Start your conversation")).toBeInTheDocument();
  });
  it("handles an empty sessions response", async () => {
    mocks.get.mockResolvedValue({ data: {} });
    render(<Chatbot />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Create session" })).toBeEnabled(),
    );
    expect(screen.getByText("Welcome to Umeed")).toBeInTheDocument();
  });
});

describe("chat messages and prescriptions", () => {
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
    fireEvent.keyDown(screen.getByPlaceholderText("Ask about health, medications, symptoms..."), {
      key: "Enter",
      shiftKey: true,
    });
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("provides recovery guidance after a message failure", async () => {
    await select();
    mocks.post.mockRejectedValue(new Error("Offline"));
    await send();
    expect(
      await screen.findByText("I apologize, but I encountered an error. Please try again."),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ask about health, medications, symptoms...")).toBeEnabled();
  });
  it("handles a response without an assistant message or title", async () => {
    await select();
    await send();
    expect(await screen.findByText("Synthetic question")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText("Ask about health, medications, symptoms..."),
      ).toBeEnabled(),
    );
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
      expect(
        await screen.findByText(/I had trouble analyzing the prescription/),
      ).toBeInTheDocument();
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
    expect(
      screen.getByPlaceholderText("Ask about health, medications, symptoms..."),
    ).toBeInTheDocument();
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
