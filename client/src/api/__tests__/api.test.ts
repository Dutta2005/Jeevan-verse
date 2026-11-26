import { describe, expect, it } from "vitest";
import { api } from "../api";

describe("API client", () => {
  it("uses the configured API base and sends credentials", () => {
    expect(api.defaults.baseURL).toMatch(/\/api\/v1$/);
    expect(api.defaults.withCredentials).toBe(true);
  });
});
