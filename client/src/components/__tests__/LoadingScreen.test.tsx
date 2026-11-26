// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import LoadingScreen from "../LoadingScreen";

it("explains that Jeevan Verse is loading", () => {
  render(<LoadingScreen />);

  expect(screen.getByText("Loading Jeevan Verse...")).toBeInTheDocument();
  expect(screen.getByText("Connecting you to healthcare services")).toBeInTheDocument();
});
