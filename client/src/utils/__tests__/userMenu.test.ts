import { describe, expect, it } from "vitest";
import { menuOptions } from "../userMenu";

describe("menuOptions", () => {
  it("provides the authenticated main navigation destinations", () => {
    expect(menuOptions.map(({ name, link, auth }) => [name, link, auth])).toEqual([
      ["Home", "/", true],
      ["Umeed", "/chatbot", true],
      ["Blood Bridge", "/bloodbridge", true],
      ["Chit Chat", "/discussions", true],
      ["Campaigns", "/posts", true],
    ]);
  });
});
