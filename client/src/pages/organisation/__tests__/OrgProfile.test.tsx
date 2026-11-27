// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrgProfile from "../OrgProfile";

const mocks = vi.hoisted(() => ({ get: vi.fn(), id: "0", loggedInId: "org-1" }));
vi.mock("../../../api/api", () => ({ api: { get: mocks.get } }));
vi.mock("react-router", () => ({ useParams: () => ({ id: mocks.id }) }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { organization: { id: mocks.loggedInId } } }),
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
  it("loads the current organization's profile and shows the edit action", async () => {
    mocks.get.mockResolvedValue({ status: 200, data: { data: profile } });
    render(<OrgProfile />);
    expect(await screen.findByText("Test Organization")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith("/organizations/profile");
    expect(screen.getByRole("button", { name: "Edit Profile" })).toBeInTheDocument();
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
    render(<OrgProfile />);
    expect(await screen.findByText("Test Organization")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith("/organizations/profile/org-2");
    expect(screen.queryByRole("button", { name: "Edit Profile" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Invalid date")).toBeInTheDocument();
  });
  it("shows skeletons during loading", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    const { container } = render(<OrgProfile />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
  it("reports profile fetch errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.get.mockRejectedValue(new Error("Offline"));
    render(<OrgProfile />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to fetch organization profile",
    );
  });
  it.each([200, 204])("handles a missing profile with response %i", async (status) => {
    mocks.get.mockResolvedValue({ status, data: { data: null } });
    const { container } = render(<OrgProfile />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
