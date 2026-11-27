// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrgProfile from "../OrgProfile";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({ get: vi.fn(), id: "0", loggedInId: "org-1" }));
vi.mock("../../../api/api", () => ({ api: { get: mocks.get } }));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useParams: () => ({ id: mocks.id }),
}));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { role: "organization", organization: { id: mocks.loggedInId } } }),
}));
const profile = {
  _id: "org-1",
  name: "Test Organization",
  email: "org@example.test",
  type: "nonprofit",
  website: "https://example.test",
  createdAt: "2026-01-01T00:00:00Z",
  description: "Synthetic profile",
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.id = "0";
  mocks.loggedInId = "org-1";
});
afterEach(() => vi.restoreAllMocks());

describe("organization profile", () => {
  it.each(["example.test", "https://["])(
    "handles organization website %s and missing descriptions",
    async (website) => {
      mocks.loggedInId = "another-org";
      mocks.get.mockResolvedValue({ data: { data: { ...profile, website, description: "" } } });
      render(
        <MemoryRouter>
          <OrgProfile />
        </MemoryRouter>,
      );
      await screen.findByText("Test Organization");
      expect(screen.getByText(/hasn.t added a description yet/)).toBeInTheDocument();
      if (website === "example.test")
        expect(screen.getByRole("link", { name: "Visit website" })).toHaveAttribute(
          "href",
          "https://example.test/",
        );
      else expect(screen.queryByRole("link", { name: "Visit website" })).not.toBeInTheDocument();
    },
  );
  it("retries the profile after a failure", async () => {
    mocks.get
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce({ data: { data: profile } });
    render(
      <MemoryRouter>
        <OrgProfile />
      </MemoryRouter>,
    );
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Test Organization")).toBeInTheDocument();
  });
  it("loads the current organization's profile and shows the edit action", async () => {
    mocks.get.mockResolvedValue({ status: 200, data: { data: profile } });
    render(
      <MemoryRouter>
        <OrgProfile />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Test Organization")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith("/organizations/profile", {
      signal: expect.any(AbortSignal),
    });
    expect(screen.getByRole("link", { name: "Create post" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://example.test" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByText("January 01, 2026")).toBeInTheDocument();
  });
  it("uses the public profile endpoint and hides editing for another organization", async () => {
    mocks.id = "org-2";
    mocks.get.mockResolvedValue({
      status: 200,
      data: { data: { ...profile, _id: "org-2", website: null, createdAt: "invalid" } },
    });
    render(
      <MemoryRouter>
        <OrgProfile />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Test Organization")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith("/organizations/profile/org-2", {
      signal: expect.any(AbortSignal),
    });
    expect(screen.queryByRole("link", { name: "Create post" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Visit website" })).not.toBeInTheDocument();
    expect(screen.getByText("Not available")).toBeInTheDocument();
  });
  it("shows skeletons during loading", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    const { container } = render(
      <MemoryRouter>
        <OrgProfile />
      </MemoryRouter>,
    );
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
  it("reports profile fetch errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.get.mockRejectedValue(new Error("Offline"));
    render(
      <MemoryRouter>
        <OrgProfile />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn’t load this organization’s profile. Please try again.",
    );
  });
  it.each([200, 204])("handles a missing profile with response %i", async (status) => {
    mocks.get.mockResolvedValue({ status, data: { data: null } });
    render(
      <MemoryRouter>
        <OrgProfile />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Organization not found")).toBeInTheDocument();
  });
});
