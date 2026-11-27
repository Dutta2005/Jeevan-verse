// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SessionSidebar from "../SessionSidebar";

const session = {
  _id: "session-1",
  title: "Synthetic session",
  metadata: {
    messageCount: 4,
    mood: "positive",
    topics: ["sleep", "exercise", "nutrition", "fourth topic"],
  },
  updatedAt: "2026-01-01T00:00:00Z",
  createdAt: "2026-01-01T00:00:00Z",
};
const props = () => ({
  sessions: [session],
  activeSessionId: "session-1",
  onSelectSession: vi.fn(),
  onCreateSession: vi.fn(),
  onDeleteSession: vi.fn(),
  onOpenInsights: vi.fn(),
  isLoading: false,
  isCollapsed: false,
  onToggleCollapse: vi.fn(),
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("chat session sidebar", () => {
  it("selects a session, creates chats, opens insights and toggles the sidebar", () => {
    const callbacks = props();
    render(<SessionSidebar {...callbacks} />);
    expect(screen.getByText("4 msgs")).toBeInTheDocument();
    expect(screen.getByText("sleep")).toBeInTheDocument();
    expect(screen.queryByText("fourth topic")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Synthetic session"));
    expect(callbacks.onSelectSession).toHaveBeenCalledWith("session-1");
    fireEvent.click(screen.getByRole("button", { name: "New Chat" }));
    expect(callbacks.onCreateSession).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Behavior Insights" }));
    expect(callbacks.onOpenInsights).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(callbacks.onToggleCollapse).toHaveBeenCalledTimes(1);
  });
  it("requires a second click to delete and does not select the session", () => {
    vi.useFakeTimers();
    const callbacks = props();
    render(<SessionSidebar {...callbacks} />);
    fireEvent.click(screen.getByTitle("Delete session"));
    expect(callbacks.onDeleteSession).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTitle("Click again to confirm"));
    expect(callbacks.onDeleteSession).toHaveBeenCalledWith("session-1");
    expect(callbacks.onSelectSession).not.toHaveBeenCalled();
    act(() => vi.runOnlyPendingTimers());
  });
  it("expires deletion confirmation after three seconds", () => {
    vi.useFakeTimers();
    const callbacks = props();
    render(<SessionSidebar {...callbacks} />);
    fireEvent.click(screen.getByTitle("Delete session"));
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByTitle("Delete session")).toBeInTheDocument();
    expect(callbacks.onDeleteSession).not.toHaveBeenCalled();
  });
  it("shows an empty state and prevents chat creation while loading", () => {
    render(<SessionSidebar {...props()} sessions={[]} isLoading />);
    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Chat" })).toBeDisabled();
  });
  it("hides sessions when collapsed", () => {
    render(<SessionSidebar {...props()} isCollapsed />);
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
    expect(screen.queryByText("Synthetic session")).not.toBeInTheDocument();
  });
  it("handles inactive sessions, unknown moods and empty metadata fields", () => {
    render(
      <SessionSidebar
        {...props()}
        activeSessionId={null}
        sessions={[{ ...session, metadata: { messageCount: 0, mood: "unknown", topics: [] } }]}
      />,
    );
    expect(screen.getByText("0 msgs")).toBeInTheDocument();
    expect(screen.queryByText("sleep")).not.toBeInTheDocument();
  });
});
