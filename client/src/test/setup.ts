import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom has no layout engine; provide the browser APIs used by Radix and motion.
if (!("ResizeObserver" in globalThis)) {
  Object.defineProperty(globalThis, "ResizeObserver", {
    configurable: true,
    value: class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
}

if (typeof window !== "undefined") {
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  }
}

if (!("IntersectionObserver" in globalThis)) {
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: class IntersectionObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  });
}

afterEach(() => {
  if (typeof document !== "undefined") cleanup();
});
