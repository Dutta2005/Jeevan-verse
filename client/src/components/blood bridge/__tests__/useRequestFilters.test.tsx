// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useRequestFilters } from "../useRequestFilters";

describe("request filter URLs", () => {
  it.each([
    ["", "all", "pending"],
    ["?filter=blood:O%2B", "O+", "all"],
    ["?filter=blood:", "all", "all"],
    ["?filter=status:completed", "all", "completed"],
    ["?filter=status:", "all", "all"],
    ["?filter=unknown", "all", "all"],
    ["?bloodGroup=bad&status=bad", "all", "all"],
    ["?bloodGroup=A-&status=rejected", "A-", "rejected"],
    ["?bloodGroup=AB%2B&status=all", "AB+", "all"],
  ])("normalizes %s", (query, bloodGroup, status) => {
    const { result } = renderHook(() => useRequestFilters(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={[`/bloodbridge${query}`]}>{children}</MemoryRouter>
      ),
    });
    expect(result.current).toMatchObject({
      bloodGroup,
      status,
      activeCount: Number(bloodGroup !== "all") + Number(status !== "all"),
    });
  });
  it("hides and restores the sidebar without dropping filters or pagination", () => {
    const { result } = renderHook(
      () => ({ ...useRequestFilters(), search: useLocation().search }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MemoryRouter initialEntries={["/bloodbridge?bloodGroup=O%2B&page=2"]}>
            {children}
          </MemoryRouter>
        ),
      },
    );
    act(() => result.current.toggleSidebar());
    expect(result.current.sidebarExpanded).toBe(false);
    expect(new URLSearchParams(result.current.search).get("page")).toBe("2");
    expect(result.current.bloodGroup).toBe("O+");
    act(() => result.current.toggleSidebar());
    expect(result.current.sidebarExpanded).toBe(true);
    expect(new URLSearchParams(result.current.search).has("filters")).toBe(false);
  });
});
