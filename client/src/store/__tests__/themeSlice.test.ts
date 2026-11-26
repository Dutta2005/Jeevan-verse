// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import themeReducer, { toggleTheme } from "../themeSlice";

describe("theme state", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("starts in dark mode", () => {
    expect(themeReducer(undefined, { type: "unknown" })).toEqual({ theme: "dark" });
  });

  it("switches to light and removes the document dark class", () => {
    document.documentElement.classList.add("dark");

    const state = themeReducer(undefined, toggleTheme());

    expect(state.theme).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("switches to dark and adds the document dark class", () => {
    const state = themeReducer({ theme: "light" }, toggleTheme());

    expect(state.theme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });
});
