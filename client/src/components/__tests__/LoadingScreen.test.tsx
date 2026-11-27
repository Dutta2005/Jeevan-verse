// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import LoadingScreen from "../LoadingScreen";

it("explains that Jeevan Verse is loading", () => {
  render(<LoadingScreen />);

  expect(screen.getByRole("status", { name: "Loading Jeevan Verse" })).toHaveAttribute(
    "aria-live",
    "polite",
  );
  expect(screen.getByText("Loading your page")).toBeInTheDocument();
});
