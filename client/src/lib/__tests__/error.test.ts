import { describe, expect, it } from "vitest";
import { getErrorMessage } from "../error";

describe("getErrorMessage", () => {
  it("prefers a non-empty server message from an Axios error", () => {
    const error = Object.assign(new Error("Request failed"), {
      isAxiosError: true,
      response: { data: { message: "Request could not be completed" } },
    });

    expect(getErrorMessage(error, "Fallback")).toBe("Request could not be completed");
  });

  it("uses the Axios error message when no server message is available", () => {
    const error = Object.assign(new Error("Network is unavailable"), {
      isAxiosError: true,
      response: { data: { message: 42 } },
    });

    expect(getErrorMessage(error, "Fallback")).toBe("Network is unavailable");
  });

  it("uses a regular Error message or the supplied fallback", () => {
    expect(getErrorMessage(new Error("Unexpected failure"), "Fallback")).toBe("Unexpected failure");
    expect(getErrorMessage({ message: "not an Error" }, "Fallback")).toBe("Fallback");
  });
});
