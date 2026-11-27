// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import authReducer, { login } from "../store/authSlice";
import themeReducer, { toggleTheme } from "../store/themeSlice";
import notificationReducer from "../store/notificationSlice";
import { initializeSocket } from "../utils/socket";

const socketMock = vi.hoisted(() => ({ on: vi.fn(), disconnect: vi.fn() }));
vi.mock("../components/navbar/Navbar", () => ({ default: () => <nav>App navigation</nav> }));
vi.mock("../utils/socket", () => ({ initializeSocket: vi.fn(() => socketMock) }));

function renderApp(signedIn: boolean, light = false) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
      notification: notificationReducer,
    },
  });
  if (signedIn) {
    store.dispatch(login({ _id: "user-1", name: "Asha", info: { bloodGroup: "O+" } }));
  }
  if (light) store.dispatch(toggleTheme());

  const view = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<p>App route content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return { ...view, store };
}

describe("App shell", () => {
  it("applies dark mode and connects notification events for an authenticated user", () => {
    socketMock.on.mockClear();
    socketMock.disconnect.mockClear();
    document.documentElement.classList.remove("dark");
    const { store, unmount } = renderApp(true);

    expect(screen.getByText("App navigation")).toBeInTheDocument();
    expect(screen.getByText("App route content")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
    expect(initializeSocket).toHaveBeenCalledWith("user-1");

    const bloodRequestHandler = socketMock.on.mock.calls.find(
      ([event]) => event === "bloodRequest",
    )?.[1] as ((notification: { _id: string; type: string; message: string }) => void) | undefined;
    bloodRequestHandler?.({ _id: "n1", type: "bloodRequest", message: "New request" });
    expect(store.getState().notification.notifications[0]?.message).toBe("New request");
    const commentHandler = socketMock.on.mock.calls.find(([event]) => event === "comment")?.[1];
    expect(commentHandler).toBeTypeOf("function");
    commentHandler({ _id: "n2", type: "comment", message: "New comment" });
    expect(store.getState().notification.notifications[0]?.message).toBe("New comment");

    unmount();
    expect(socketMock.disconnect).toHaveBeenCalledOnce();
  });

  it("clears dark mode and skips the socket without a signed-in user", () => {
    socketMock.disconnect.mockClear();
    vi.mocked(initializeSocket).mockClear();
    document.documentElement.classList.add("dark");
    renderApp(false, true);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(initializeSocket).not.toHaveBeenCalled();
  });
});
