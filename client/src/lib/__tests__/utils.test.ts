import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("merges conflicting Tailwind classes while preserving unrelated classes", () => {
    expect(cn("px-2 py-1", "px-4", "text-sm")).toBe("py-1 px-4 text-sm");
  });

  it("supports conditional class values", () => {
    expect(cn("button", { hidden: false }, ["active", { disabled: false }])).toBe("button active");
  });
});
