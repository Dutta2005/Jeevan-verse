// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SessionSidebar, { UmeedHistory } from "../SessionSidebar";
import { UmeedProvider } from "../UmeedWorkspace";
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock("@/api/api", () => ({ api }));

const session = {
  _id: "session-1",
  title: "Synthetic session",
  metadata: { messageCount: 4, mood: "positive", topics: [] },
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
});

describe("chat history", () => {
  it.each([true, false])(
    "wires workspace actions to saved sessions (mobile: %s)",
    async (mobile) => {
      vi.clearAllMocks();
      api.get.mockImplementation((url: string) =>
        Promise.resolve({
          data: {
            data:
              url === "/chat/sessions"
                ? [session, { ...session, _id: "s2", title: "", updatedAt: "invalid" }]
                : { messages: [] },
          },
        }),
      );
      api.post.mockResolvedValue({ data: { data: { ...session, _id: "new" } } });
      api.delete.mockResolvedValue({});
      const navigate = vi.fn();
      render(
        <UmeedProvider>
          <UmeedHistory onNavigate={mobile ? navigate : undefined} />
        </UmeedProvider>,
      );
      await userEvent.click(await screen.findByRole("button", { name: "Untitled chat" }));
      await userEvent.click(screen.getByRole("button", { name: "New chat" }));
      await userEvent.click(screen.getByRole("button", { name: "Health insights" }));
      expect(navigate).toHaveBeenCalledTimes(mobile ? 3 : 0);
      await userEvent.click(screen.getByRole("button", { name: "Options for Untitled chat" }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Delete chat" }));
      await userEvent.click(
        within(screen.getByRole("alertdialog")).getByRole("button", { name: "Keep chat" }),
      );
      expect(api.delete).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole("button", { name: "Options for Untitled chat" }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Delete chat" }));
      await userEvent.click(
        within(screen.getByRole("alertdialog")).getByRole("button", { name: "Delete chat" }),
      );
      expect(api.delete).toHaveBeenCalledWith("/chat/sessions/s2");
    },
  );
  it("opens saved chats, starts a chat and opens insights", () => {
    const callbacks = props();
    render(<SessionSidebar {...callbacks} />);
    fireEvent.click(screen.getByRole("button", { name: "Synthetic session" }));
    expect(callbacks.onSelectSession).toHaveBeenCalledWith("session-1");
    fireEvent.click(screen.getByRole("button", { name: "New chat" }));
    expect(callbacks.onCreateSession).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Health insights" }));
    expect(callbacks.onOpenInsights).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Synthetic session" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
  it("filters saved chat titles without requesting or searching message contents", () => {
    render(<SessionSidebar {...props()} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Search chat titles" }), {
      target: { value: "missing" },
    });
    expect(screen.getByText("No matching chat titles")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Synthetic session" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Search chat titles" }), {
      target: { value: "SYNTHETIC" },
    });
    expect(screen.getByRole("button", { name: "Synthetic session" })).toBeInTheDocument();
  });
  it("confirms deletion without selecting the conversation", async () => {
    const callbacks = props();
    render(<SessionSidebar {...callbacks} />);
    await userEvent.click(screen.getByRole("button", { name: "Options for Synthetic session" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete chat" }));
    expect(callbacks.onDeleteSession).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Delete chat" }));
    expect(callbacks.onDeleteSession).toHaveBeenCalledWith("session-1");
    expect(callbacks.onSelectSession).not.toHaveBeenCalled();
  });
  it("shows loading placeholders and disables creation while loading", () => {
    render(<SessionSidebar {...props()} sessions={[]} isLoading />);
    expect(screen.getByLabelText("Loading chats")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New chat" })).toBeDisabled();
  });
  it("shows an empty history", () => {
    render(<SessionSidebar {...props()} sessions={[]} />);
    expect(screen.getByText("No chats yet")).toBeInTheDocument();
  });
});
