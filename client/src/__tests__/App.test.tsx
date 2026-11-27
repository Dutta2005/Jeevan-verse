// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import authReducer, { login } from "../store/authSlice";
import themeReducer, { toggleTheme } from "../store/themeSlice";
import notificationReducer from "../store/notificationSlice";
import { initializeSocket } from "../utils/socket";
import type { ReactNode } from "react";

const socketMock = vi.hoisted(() => ({ on: vi.fn(), connect: vi.fn(), disconnect: vi.fn() }));
const get = vi.hoisted(() => vi.fn());
vi.mock("../api/api", () => ({ api: { get } }));
vi.mock("../components/navbar/Navbar", () => ({ default: () => <nav>App navigation</nav> }));
vi.mock("../components/layouts/ProtectedLayout", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <>
      <nav>App navigation</nav>
      {children}
    </>
  ),
}));
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
  it("fetches authenticated history and refreshes when the live room is ready or activity arrives", async () => {
    socketMock.on.mockClear();
    socketMock.disconnect.mockClear();
    get.mockReset().mockResolvedValue({ data: { data: [] } });
    document.documentElement.classList.remove("dark");
    const { store, unmount } = renderApp(true);

    expect(screen.getByText("App navigation")).toBeInTheDocument();
    expect(screen.getByText("App route content")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
    expect(initializeSocket).toHaveBeenCalledWith("user-1");

    await waitFor(() => expect(store.getState().notification.status).toBe("ready"));
    const emit = (event: string) => {
      const handler = socketMock.on.mock.calls.find(([name]) => name === event)?.[1];
      expect(handler).toBeTypeOf("function");
      act(() => handler());
    };
    emit("roomJoined");
    expect(store.getState().notification.live).toBe(true);
    for (const event of ["bloodRequest", "comment"]) {
      emit(event);
    }
    await waitFor(() => expect(store.getState().notification.status).toBe("ready"));
    expect(get).toHaveBeenCalledTimes(4);
    emit("disconnect");
    expect(store.getState().notification.live).toBe(false);

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
