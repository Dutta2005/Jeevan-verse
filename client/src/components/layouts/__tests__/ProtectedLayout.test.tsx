// @vitest-environment jsdom
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import authReducer, { login, loginOrganization } from "@/store/authSlice";
import themeReducer from "@/store/themeSlice";
import ProtectedLayout from "../ProtectedLayout";

vi.mock("@/components/navbar/Notifications", () => ({
  default: () => <button>Notifications</button>,
}));
vi.mock("@/components/Logoutbtn", () => ({ default: () => <button>Log out individual</button> }));
vi.mock("@/components/organisation/OrgLogoutBtn", () => ({
  default: () => <button>Log out organization</button>,
}));
vi.mock("@/api/api", () => ({ api: { get: vi.fn().mockResolvedValue({ data: { data: [] } }) } }));
vi.mock("@/components/chatbot/SessionSidebar", () => ({
  UmeedHistory: ({ onNavigate }: { onNavigate?: () => void }) => (
    <button onClick={onNavigate}>Open recent chat</button>
  ),
}));

function mount(path = "/", audience?: "individual" | "organization", name = "Asha") {
  const store = configureStore({ reducer: { auth: authReducer, theme: themeReducer } });
  if (audience === "organization") store.dispatch(loginOrganization({ _id: "org-1", name }));
  else store.dispatch(login({ _id: "user-1", name, info: { bloodGroup: "O+" } }));
  const view = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <ProtectedLayout audience={audience}>
          <p>Workspace content</p>
        </ProtectedLayout>
      </MemoryRouter>
    </Provider>,
  );
  return { ...view, store };
}

describe("protected workspace", () => {
  it("has one Community destination for discussions and organization updates", () => {
    mount("/discussions");
    const navigation = screen.getByRole("navigation", { name: "Workspace navigation" });
    expect(within(navigation).getByRole("link", { name: "Community" })).toHaveAttribute(
      "href",
      "/discussions",
    );
    expect(
      within(navigation).queryByRole("link", { name: "Organization posts" }),
    ).not.toBeInTheDocument();
  });
  it.each(["individual", "organization"] as const)(
    "offers the %s navigation and account menu",
    async (audience) => {
      mount(audience === "organization" ? "/organisation" : "/", audience);
      expect(screen.getByText("Workspace content")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
      await userEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
      await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
      expect(
        await screen.findByRole("button", { name: `Log out ${audience}` }),
      ).toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      await userEvent.click(screen.getByRole("button", { name: "Open navigation" }));
      const nav = screen.getByRole("navigation", { name: "Mobile workspace navigation" });
      expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await userEvent.click(
        within(nav).getByRole("link", {
          name: audience === "organization" ? "Posts" : "Community",
        }),
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    },
  );
  it("opens a recent chat from the mobile history and closes navigation", async () => {
    mount("/chatbot");
    await userEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Open recent chat" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("uses a fallback title and account label when no name is available", async () => {
    mount("/unknown", "individual", "");
    expect(screen.getByText("Jeevan Verse", { selector: "span[title]" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account menu" })).toHaveTextContent("A");
    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByText("Your account")).toBeInTheDocument();
  });
});
