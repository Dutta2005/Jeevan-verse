// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import PostSkeleton from "../PostSkeleton";

it("renders post loading placeholders", () => {
  const { container } = render(<PostSkeleton />);
  expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
});
