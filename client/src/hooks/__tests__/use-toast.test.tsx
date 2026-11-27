// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reducer, toast, useToast } from "../use-toast";

const makeToast = (id: string, title: string, open = true) => ({
  id,
  title,
  open,
  onOpenChange: vi.fn(),
});

describe("toast reducer", () => {
  it("adds the newest toast and enforces the single-toast limit", () => {
    const first = makeToast("first", "First");
    const second = makeToast("second", "Second");

    expect(reducer({ toasts: [] }, { type: "ADD_TOAST", toast: first })).toEqual({
      toasts: [first],
    });
    expect(reducer({ toasts: [first] }, { type: "ADD_TOAST", toast: second }).toasts).toEqual([
      second,
    ]);
  });

  it("updates only the matching toast", () => {
    const first = makeToast("first", "First");
    const second = makeToast("second", "Second");
    const result = reducer(
      { toasts: [first, second] },
      { type: "UPDATE_TOAST", toast: { id: "second", title: "Updated" } },
    );

    expect(result.toasts).toEqual([first, { ...second, title: "Updated" }]);
    expect(
      reducer({ toasts: [first] }, { type: "UPDATE_TOAST", toast: { id: "missing" } }).toasts,
    ).toEqual([first]);
  });

  it("dismisses one toast and removes it after the delay", () => {
    vi.useFakeTimers();
    const first = makeToast("first", "First");
    const second = makeToast("second", "Second");
    const dismissed = reducer(
      { toasts: [first, second] },
      { type: "DISMISS_TOAST", toastId: "first" },
    );

    expect(dismissed.toasts.map(({ open }) => open)).toEqual([false, true]);

    const duplicateDismiss = reducer(dismissed, {
      type: "DISMISS_TOAST",
      toastId: "first",
    });
    expect(duplicateDismiss.toasts[0]?.open).toBe(false);

    vi.runAllTimers();
  });

  it("dismisses all toasts and supports removing one or all", () => {
    const first = makeToast("first", "First");
    const second = makeToast("second", "Second");
    const state = { toasts: [first, second] };
    const dismissed = reducer(state, { type: "DISMISS_TOAST" });

    expect(dismissed.toasts.every(({ open }) => !open)).toBe(true);
    expect(reducer(state, { type: "REMOVE_TOAST", toastId: "first" }).toasts).toEqual([second]);
    expect(reducer(state, { type: "REMOVE_TOAST" }).toasts).toEqual([]);
  });
});

describe("useToast", () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("publishes toasts, updates them, and dismisses them", () => {
    const { result, unmount } = renderHook(() => useToast());
    let createdId = "";
    let createdToast: ReturnType<typeof toast> | undefined;

    act(() => {
      createdToast = result.current.toast({ title: "Created" });
      createdId = createdToast.id;
    });
    expect(result.current.toasts[0]?.title).toBe("Created");

    act(() => {
      result.current.toasts[0]?.onOpenChange?.(true);
    });
    expect(result.current.toasts[0]?.open).toBe(true);

    act(() => {
      createdToast?.update({
        ...result.current.toasts[0]!,
        title: "Updated",
      });
    });
    expect(result.current.toasts[0]?.title).toBe("Updated");

    act(() => {
      result.current.toasts[0]?.onOpenChange?.(false);
    });
    expect(result.current.toasts[0]?.open).toBe(false);

    act(() => {
      result.current.dismiss(createdId);
    });
    expect(result.current.toasts[0]?.open).toBe(false);

    unmount();
    vi.runAllTimers();
  });

  it("exposes the standalone toast helper", () => {
    const created = toast({ title: "Standalone" });
    expect(created.id).toMatch(/^\d+$/);
    created.dismiss();
    vi.runAllTimers();
  });
});
