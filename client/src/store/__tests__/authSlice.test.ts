import { describe, expect, it } from "vitest";
import authReducer, { login, loginOrganization, logout } from "../authSlice";

describe("auth state", () => {
  it("starts signed out", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual({
      user: null,
      organization: null,
      role: null,
      isAuthenticated: false,
    });
  });

  it("stores a user profile and clears organization state on user login", () => {
    const signedIn = authReducer(
      {
        user: null,
        organization: { id: "org-1", name: "Community Clinic" },
        role: "organization",
        isAuthenticated: true,
      },
      login({
        _id: "user-1",
        name: "Asha",
        info: { bloodGroup: "O+" },
      }),
    );

    expect(signedIn).toEqual({
      user: { id: "user-1", name: "Asha", bloodGroup: "O+" },
      organization: null,
      role: "user",
      isAuthenticated: true,
    });
  });

  it("stores an organization profile and clears user state on organization login", () => {
    const signedIn = authReducer(
      {
        user: { id: "user-1", name: "Asha", bloodGroup: "O+" },
        organization: null,
        role: "user",
        isAuthenticated: true,
      },
      loginOrganization({ _id: "org-1", name: "Community Clinic" }),
    );

    expect(signedIn).toEqual({
      user: null,
      organization: { id: "org-1", name: "Community Clinic" },
      role: "organization",
      isAuthenticated: true,
    });
  });

  it("clears both account types on logout", () => {
    const signedOut = authReducer(
      {
        user: { id: "user-1", name: "Asha", bloodGroup: "O+" },
        organization: null,
        role: "user",
        isAuthenticated: true,
      },
      logout(),
    );

    expect(signedOut).toEqual({
      user: null,
      organization: null,
      role: null,
      isAuthenticated: false,
    });
  });
});
