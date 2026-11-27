// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

// Capture React.lazy registrations to validate every deferred module without mounting pages.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  lazy: (loader: () => Promise<unknown>) => loader,
}));

import * as routes from "../lazy-pages";

describe("lazy route registrations", () => {
  it.each(Object.entries(routes))(
    "loads the %s module with a default component",
    async (_name, registration) => {
      const load = registration as unknown as () => Promise<{ default: unknown }>;
      const module = await load();
      expect(module.default).toBeTypeOf("function");
    },
    15000,
  );
});
