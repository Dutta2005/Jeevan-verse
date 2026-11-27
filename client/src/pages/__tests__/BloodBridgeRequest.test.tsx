// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BloodBridgeRequest from "../BloodBridgeRequest";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({ get: vi.fn(), userId: "owner" }));
vi.mock("../../api/api", () => ({ api: { get: mocks.get } }));
vi.mock("../../components/blood bridge/BeVolunteer", () => ({
  default: ({ onJoined }: { onJoined: () => void }) => (
    <button onClick={onJoined}>Be a Volunteer</button>
  ),
}));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useParams: () => ({ id: "request-1" }),
}));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { user: { id: mocks.userId } } }),
}));
const request = {
  _id: "request-1",
  userId: "owner",
  bloodGroup: "O+",
  urgency: "high",
  status: "pending",
  message: "Synthetic request",
  address: { city: "Test City", district: "Test District", state: "Test State" },
  contactDetails: { email: "requester@example.test", phone: "0000000000" },
  createdAt: "2026-01-01T00:00:00Z",
  volunteers: [],
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.userId = "owner";
});
const mount = () =>
  render(
    <MemoryRouter>
      <BloodBridgeRequest />
    </MemoryRouter>,
  );

describe("blood request detail", () => {
  it.each(["resolve", "reject"])(
    "ignores late detail results after unmount (%s)",
    async (outcome) => {
      let finish!: (value: unknown) => void;
      let fail!: (reason: unknown) => void;
      mocks.get.mockReturnValue(
        new Promise((resolve, reject) => {
          finish = resolve;
          fail = reject;
        }),
      );
      const view = mount();
      view.unmount();
      await act(async () => {
        if (outcome === "resolve") finish({ data: { data: request } });
        else fail(new Error("Offline"));
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );
  it("retries a failed load and refreshes after joining", async () => {
    mocks.userId = "other";
    mocks.get
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValue({ data: { data: request } });
    mount();
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await userEvent.click(await screen.findByRole("button", { name: "Be a Volunteer" }));
    expect(mocks.get).toHaveBeenCalledTimes(3);
  });
  it.each(["/bloodbridge?page=2", "/outside"])(
    "returns safely to the request list from %s",
    async (from) => {
      mocks.get.mockResolvedValue({ data: { data: request } });
      render(
        <MemoryRouter
          initialEntries={[{ pathname: "/bloodbridge/request/request-1", state: { from } }]}
        >
          <BloodBridgeRequest />
        </MemoryRouter>,
      );
      expect(screen.getByRole("link", { name: "Back to requests" })).toHaveAttribute(
        "href",
        from.startsWith("/bloodbridge?") ? from : "/bloodbridge",
      );
      await screen.findByText("Synthetic request");
    },
  );
  it("shows a volunteer's registration and handles deleted volunteer accounts", async () => {
    mocks.userId = "v1";
    mocks.get.mockResolvedValue({
      data: { data: { ...request, volunteers: [{ user: { _id: "v1" }, canShareDetails: false }] } },
    });
    mount();
    expect(await screen.findByText("You volunteered")).toBeInTheDocument();
  });
  it("renders incomplete optional request and volunteer details", async () => {
    mocks.get.mockResolvedValue({
      data: {
        data: {
          ...request,
          message: "",
          createdAt: "invalid",
          address: {},
          contactDetails: { phone: "000" },
          volunteers: [
            { _id: "v", user: null, canShareDetails: true },
            { user: null, canShareDetails: false },
          ],
        },
      },
    });
    mount();
    expect(await screen.findByText("No additional details")).toBeInTheDocument();
    expect(screen.getAllByText("Member unavailable")).toHaveLength(2);
  });
  it.each([
    ["high", "pending"],
    ["medium", "completed"],
    ["low", "rejected"],
    ["other", "other"],
  ])("renders urgency %s and status %s", async (urgency, status) => {
    mocks.get.mockResolvedValue({ data: { data: { ...request, urgency, status } } });
    mount();
    expect(await screen.findByText("Synthetic request")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith("/blood-requests/request-1");
    expect(
      screen.getByText(`${urgency[0].toUpperCase() + urgency.slice(1)} urgency`),
    ).toBeInTheDocument();
    expect(screen.getByText("No volunteers yet.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Be a Volunteer" })).not.toBeInTheDocument();
  });
  it("shows volunteer contacts to the owner only when consent was given", async () => {
    mocks.get.mockResolvedValue({
      data: {
        data: {
          ...request,
          volunteers: [
            {
              user: {
                _id: "v1",
                name: "Sharing volunteer",
                phone: "1111111111",
                email: "sharing@example.test",
              },
              canShareDetails: true,
            },
            {
              user: {
                _id: "v2",
                name: "Private volunteer",
                phone: "2222222222",
                email: "private@example.test",
              },
              canShareDetails: false,
            },
            {
              user: { _id: "v3", name: "Missing contact", phone: "", email: "" },
              canShareDetails: true,
            },
          ],
        },
      },
    });
    mount();
    expect(await screen.findByText("Sharing volunteer")).toBeInTheDocument();
    expect(screen.getByText("sharing@example.test")).toBeInTheDocument();
    expect(screen.getByText("Contact details hidden")).toBeInTheDocument();
    expect(screen.queryByText("private@example.test")).not.toBeInTheDocument();
    expect(screen.queryByText("2222222222")).not.toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });
  it("hides the volunteer roster from another user and offers volunteering", async () => {
    mocks.userId = "other-user";
    mocks.get.mockResolvedValue({
      data: {
        data: {
          ...request,
          volunteers: [
            {
              user: {
                _id: "v1",
                name: "Sharing volunteer",
                phone: "1111111111",
                email: "sharing@example.test",
              },
              canShareDetails: true,
            },
          ],
        },
      },
    });
    mount();
    expect(await screen.findByText("1 volunteer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Be a Volunteer" })).toBeInTheDocument();
    expect(screen.queryByText("Sharing volunteer")).not.toBeInTheDocument();
    expect(screen.queryByText("sharing@example.test")).not.toBeInTheDocument();
  });
  it("shows loading feedback", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    expect(mount().container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
  it("handles missing records", async () => {
    mocks.get.mockResolvedValue({ data: { data: null } });
    mount();
    expect(await screen.findByText("No request found.")).toBeInTheDocument();
  });
  it("reports loading errors", async () => {
    mocks.get.mockRejectedValue(new Error("Offline"));
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load request details");
  });
});
