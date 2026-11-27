// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIndianCities } from "../useIndianCities";

const load = vi.hoisted(() => vi.fn());
vi.mock("@/lib/india-locations", () => ({ getIndianCities: load }));
beforeEach(() => vi.resetAllMocks());

describe("on-demand city suggestions", () => {
  it("waits for a state selection before loading cities", async () => {
    load.mockResolvedValue(["Kolkata"]);
    const { result, rerender } = renderHook(({ code }) => useIndianCities(code), {
      initialProps: { code: "" },
    });
    expect(load).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    rerender({ code: "WB" });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.cities).toEqual(["Kolkata"]));
    expect(load).toHaveBeenCalledWith("WB");
    rerender({ code: "" });
    expect(result.current.cities).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("reports failed imports and retries on request", async () => {
    load.mockRejectedValueOnce(new Error("Network unavailable")).mockResolvedValueOnce(["Kolkata"]);
    const { result } = renderHook(() => useIndianCities("WB"));
    await waitFor(() => expect(result.current.error).toBe("City suggestions could not be loaded."));
    expect(result.current.isLoading).toBe(false);
    act(() => result.current.retry());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    await waitFor(() => expect(result.current.cities).toEqual(["Kolkata"]));
  });

  it.each(["resolve", "reject"])("ignores a previous state's late %s response", async (outcome) => {
    let finish!: (value: string[]) => void;
    let fail!: (reason: unknown) => void;
    load
      .mockReturnValueOnce(
        new Promise<string[]>((resolve, reject) => {
          finish = resolve;
          fail = reject;
        }),
      )
      .mockResolvedValueOnce(["Mumbai"]);
    const { result, rerender } = renderHook(({ code }) => useIndianCities(code), {
      initialProps: { code: "WB" },
    });
    rerender({ code: "MH" });
    expect(result.current.cities).toEqual([]);
    await waitFor(() => expect(result.current.cities).toEqual(["Mumbai"]));
    await act(async () => {
      if (outcome === "resolve") finish(["Kolkata"]);
      else fail(new Error("Offline"));
    });
    expect(result.current.cities).toEqual(["Mumbai"]);
    expect(result.current.error).toBeNull();
  });
});
