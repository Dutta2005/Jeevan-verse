import { describe, expect, it, vi } from "vitest";
import { getAllBloodRequests } from "../bloodRequest.controller.js";
import { BloodRequest } from "../../models/bloodRequest.model.js";

function listBloodRequests(query) {
  return new Promise((resolve, reject) => {
    const response = {
      status(statusCode) {
        return { json: (body) => resolve({ statusCode, body }) };
      },
    };

    getAllBloodRequests({ query }, response, reject);
  });
}

describe("getAllBloodRequests", () => {
  it.each([
    [{ bloodGroup: "invalid" }, "Invalid blood group"],
    [{ status: "invalid" }, "Invalid request status"],
  ])(
    "rejects unsupported filters before querying MongoDB",
    async (query, message) => {
      const countDocuments = vi
        .spyOn(BloodRequest, "countDocuments")
        .mockResolvedValue(0);
      const find = vi.spyOn(BloodRequest, "find").mockImplementation(() => {
        throw new Error("Invalid filters must never reach the database");
      });

      await expect(listBloodRequests(query)).resolves.toEqual({
        statusCode: 400,
        body: { statusCode: 400, success: false, message },
      });
      expect(countDocuments).not.toHaveBeenCalled();
      expect(find).not.toHaveBeenCalled();
    }
  );

  it("uses the same filters for the count and the newest-first page", async () => {
    const requests = [{ bloodGroup: "O+", status: "pending" }];
    const databaseQuery = BloodRequest.find({
      bloodGroup: "O+",
      status: "pending",
    });
    vi.spyOn(databaseQuery, "exec").mockResolvedValue(requests);
    const countDocuments = vi
      .spyOn(BloodRequest, "countDocuments")
      .mockResolvedValue(5);
    const find = vi.spyOn(BloodRequest, "find").mockReturnValue(databaseQuery);

    await expect(
      listBloodRequests({
        bloodGroup: "O+",
        status: "pending",
        page: "3",
        limit: "2",
      })
    ).resolves.toMatchObject({
      statusCode: 200,
      body: {
        success: true,
        data: {
          bloodRequests: requests,
          currentPage: 3,
          totalPages: 3,
          totalRequests: 5,
          hasNext: false,
          hasPrev: true,
        },
      },
    });
    expect(countDocuments).toHaveBeenCalledWith({
      bloodGroup: "O+",
      status: "pending",
    });
    expect(find).toHaveBeenCalledWith({ bloodGroup: "O+", status: "pending" });
    expect(databaseQuery.getOptions()).toMatchObject({
      sort: { createdAt: -1 },
      skip: 4,
      limit: 2,
    });
  });
});
