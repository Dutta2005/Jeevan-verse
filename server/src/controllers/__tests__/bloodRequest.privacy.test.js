import { describe, expect, it, vi } from "vitest";
import {
  getBloodRequestById,
  updateVolunteerPreferences,
} from "../bloodRequest.controller.js";
import { BloodRequest } from "../../models/bloodRequest.model.js";

function invoke(handler, request) {
  return new Promise((resolve, reject) => {
    handler(
      request,
      {
        status: (statusCode) => ({
          json: (body) => resolve({ statusCode, body }),
        }),
      },
      reject
    );
  });
}

describe("volunteer contact privacy", () => {
  it.each([
    ["anonymous", undefined, false, false],
    ["another user", "viewer", false, false],
    ["request creator", "creator", false, false],
    ["volunteer themself", "volunteer", false, true],
    ["consenting volunteer", "viewer", true, true],
  ])("applies contact consent for %s", async (_, viewer, consent, visible) => {
    const user = {
      _id: "volunteer",
      name: "Test volunteer",
      phone: "0000000000",
      email: "volunteer@example.test",
    };
    const record = {
      userId: { _id: "creator" },
      volunteers: [{ user, canShareDetails: consent }],
    };
    const query = BloodRequest.findById("507f1f77bcf86cd799439011");
    vi.spyOn(query, "exec").mockResolvedValue(record);
    vi.spyOn(BloodRequest, "findById").mockReturnValue(query);
    const response = await invoke(getBloodRequestById, {
      params: { id: "507f1f77bcf86cd799439011" },
      user: viewer ? { _id: viewer } : undefined,
    });
    expect(response.statusCode).toBe(200);
    const returned = response.body.data.volunteers[0].user;
    expect(returned.name).toBe("Test volunteer");
    expect(returned.phone).toBe(visible ? "0000000000" : undefined);
    expect(returned.email).toBe(visible ? "volunteer@example.test" : undefined);
  });

  it("changes only the signed-in volunteer's consent", async () => {
    const record = {
      volunteers: [
        { user: "other", canShareDetails: true },
        { user: "self", canShareDetails: true },
      ],
      save: vi.fn(),
    };
    record.save.mockResolvedValue(record);
    vi.spyOn(BloodRequest, "findById").mockResolvedValue(record);
    const response = await invoke(updateVolunteerPreferences, {
      params: { id: "request" },
      user: { _id: "self" },
      body: { user: "other", canShareDetails: false },
    });
    expect(response.statusCode).toBe(200);
    expect(record.volunteers.map((v) => v.canShareDetails)).toEqual([
      true,
      false,
    ]);
    expect(record.save).toHaveBeenCalledOnce();
  });

  it("does not save preferences for someone who is not a volunteer", async () => {
    const record = {
      volunteers: [{ user: "other", canShareDetails: true }],
      save: vi.fn(),
    };
    vi.spyOn(BloodRequest, "findById").mockResolvedValue(record);
    const response = await invoke(updateVolunteerPreferences, {
      params: { id: "request" },
      user: { _id: "outsider" },
      body: { canShareDetails: false },
    });
    expect(response.body.success).toBe(false);
    expect(record.save).not.toHaveBeenCalled();
    expect(record.volunteers[0].canShareDetails).toBe(true);
  });
});
