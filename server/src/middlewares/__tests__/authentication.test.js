import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { verifyJWT as userAuth } from "../auth.middleware.js";
import { verifyJWT as organizationAuth } from "../org.middleware.js";
import { User } from "../../models/user.model.js";
import { Organization } from "../../models/organization.model.js";

function authenticate(middleware, request) {
  return new Promise((resolve, reject) => {
    middleware(request, {}, (error) =>
      error ? reject(error) : resolve(request)
    );
  });
}

describe.each([
  ["user", userAuth, User, "user"],
  ["organization", organizationAuth, Organization, "organization"],
])("%s authentication", (_, middleware, model, property) => {
  let verify;
  let find;
  let select;
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    verify = vi.spyOn(jwt, "verify").mockReturnValue({ _id: "account-id" });
    select = vi
      .fn()
      .mockResolvedValue({ _id: "account-id", name: "Test account" });
    find = vi.spyOn(model, "findById").mockReturnValue({ select });
  });

  it("rejects missing credentials before looking up an account", async () => {
    await expect(
      authenticate(middleware, { cookies: {}, header: () => undefined })
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(verify).not.toHaveBeenCalled();
    expect(find).not.toHaveBeenCalled();
  });

  it.each(["cookie", "header"])(
    "accepts a valid %s token and excludes credentials",
    async (source) => {
      const request = {
        cookies: source === "cookie" ? { accessToken: "synthetic-token" } : {},
        header: () =>
          source === "header" ? "Bearer synthetic-token" : undefined,
      };
      await authenticate(middleware, request);
      expect(verify.mock.calls[0][0]).toBe("synthetic-token");
      expect(find).toHaveBeenCalledWith("account-id");
      expect(select).toHaveBeenCalledWith("-password -refreshToken");
      expect(request[property]).toEqual({
        _id: "account-id",
        name: "Test account",
      });
    }
  );

  it("prefers the cookie when both credential sources are present", async () => {
    await authenticate(middleware, {
      cookies: { accessToken: "cookie-token" },
      header: () => "Bearer header-token",
    });
    expect(verify.mock.calls[0][0]).toBe("cookie-token");
  });

  it.each(["JsonWebTokenError", "TokenExpiredError"])(
    "rejects %s without a database lookup",
    async (name) => {
      verify.mockImplementation(() => {
        throw Object.assign(new Error("Invalid test token"), { name });
      });
      const request = {
        cookies: { accessToken: "invalid-token" },
        header: () => undefined,
      };
      await expect(authenticate(middleware, request)).rejects.toBeInstanceOf(
        Error
      );
      expect(find).not.toHaveBeenCalled();
      expect(request[property]).toBeUndefined();
    }
  );

  it("rejects a token whose account no longer exists", async () => {
    select.mockResolvedValue(null);
    await expect(
      authenticate(middleware, {
        cookies: { accessToken: "token" },
        header: () => undefined,
      })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("does not authenticate when the account lookup fails", async () => {
    select.mockRejectedValue(new Error("Database unavailable"));
    const request = {
      cookies: { accessToken: "token" },
      header: () => undefined,
    };
    await expect(authenticate(middleware, request)).rejects.toBeInstanceOf(
      Error
    );
    expect(request[property]).toBeUndefined();
  });
});
