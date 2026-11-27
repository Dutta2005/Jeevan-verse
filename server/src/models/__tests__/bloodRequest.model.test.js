import { describe, expect, it } from "vitest";
import { BloodRequest } from "../bloodRequest.model.js";

function makeBloodRequest(overrides = {}) {
  return new BloodRequest({
    userId: "507f1f77bcf86cd799439011",
    bloodGroup: "O+",
    urgency: "high",
    contactDetails: { phone: "+12025550100" },
    address: {
      state: "Test State",
      district: "Test District",
      city: "Test City",
    },
    ...overrides,
  });
}

describe("BloodRequest validation", () => {
  it("defaults a valid new request to pending", () => {
    const request = makeBloodRequest();

    expect(request.validateSync()).toBeUndefined();
    expect(request.status).toBe("pending");
  });

  it.each([
    ["bloodGroup", "invalid"],
    ["urgency", "invalid"],
    ["status", "invalid"],
  ])("rejects an unsupported %s", (field, value) => {
    const request = makeBloodRequest({ [field]: value });

    expect(request.validateSync()?.errors[field]?.kind).toBe("enum");
  });
});
