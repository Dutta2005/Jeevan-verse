// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import DiscussionPostSkeleton from "../DiscussionPostSkeleton";

it("renders post loading placeholders", () => {
  const { container } = render(<DiscussionPostSkeleton />);
  expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
});
