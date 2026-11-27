// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Requests from "../Requests";
import { Sheet } from "@/components/ui/sheet";

const mocks = vi.hoisted(() => ({ get: vi.fn(), bloodGroup: "O+" as string | undefined }));
vi.mock("../../../api/api", () => ({ api: { get: mocks.get } }));
vi.mock("../BeVolunteer", () => ({
  default: ({ onJoined }: { onJoined: () => void }) => (
    <button onClick={onJoined}>Be a Volunteer</button>
  ),
}));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { user: { id: "u1", bloodGroup: mocks.bloodGroup } } }),
}));
const request = {
  _id: "r1",
  bloodGroup: "O+",
  urgency: "high",
  message: "Synthetic request",
  status: "pending",
  address: { state: "Test State", district: "Test District", city: "Test City" },
  contactDetails: { email: "request@example.test", phone: "0000000000" },
  volunteers: [],
};
const response = (page = 1) => ({
  status: 200,
  data: {
    data: {
      bloodRequests: [request],
      currentPage: page,
      totalPages: 2,
      hasNext: page === 1,
      hasPrev: page === 2,
    },
  },
});
beforeEach(() => {
  vi.resetAllMocks();
  mocks.bloodGroup = "O+";
  mocks.get.mockResolvedValue(response());
});
const mount = () =>
  render(
    <MemoryRouter>
      <Sheet>
        <Requests filterSidebarId="request-filters" onCloseFilters={() => {}} />
      </Sheet>
    </MemoryRouter>,
  );

describe("blood request list", () => {
  it.each(["resolve", "reject"])(
    "ignores late browse results after unmount (%s)",
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
        if (outcome === "resolve") finish(response());
        else fail(new Error("Offline"));
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );
  it("normalizes an invalid page and supplies an excerpt for a blank message", async () => {
    const value = response();
    mocks.get.mockResolvedValue({
      ...value,
      data: {
        data: {
          ...value.data.data,
          bloodRequests: [{ ...request, message: "", volunteers: [{ user: null }] }],
        },
      },
    });
    render(
      <MemoryRouter initialEntries={["/bloodbridge?page=-1"]}>
        <Sheet>
          <Requests filterSidebarId="filters" onCloseFilters={() => {}} />
        </Sheet>
      </MemoryRouter>,
    );
    expect(await screen.findByText("No additional details")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith("/blood-requests?status=pending&page=1");
    expect(screen.getByText("1 volunteer")).toBeInTheDocument();
  });
  it("retries a failed fetch and refreshes after volunteering", async () => {
    mocks.get.mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(response());
    mount();
    await screen.findByText("Offline");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await userEvent.click(await screen.findByRole("button", { name: "Be a Volunteer" }));
    await waitFor(() => expect(mocks.get).toHaveBeenCalledTimes(3));
  });
  it.each(["u1", { _id: "u1" }])(
    "recognizes existing volunteers with either user representation",
    async (user) => {
      const value = response();
      mocks.get.mockResolvedValue({
        ...value,
        data: {
          data: { ...value.data.data, bloodRequests: [{ ...request, volunteers: [{ user }] }] },
        },
      });
      mount();
      expect(await screen.findByText("You volunteered")).toBeInTheDocument();
    },
  );
  it("offers clearing filters from an empty result", async () => {
    mocks.get.mockResolvedValue({ status: 200, data: { data: { bloodRequests: [] } } });
    mount();
    await screen.findByText("No requests found");
    await userEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[1]!);
    await waitFor(() => expect(mocks.get).toHaveBeenLastCalledWith("/blood-requests?page=1"));
  });
  it("defaults to open requests and paginates both ways", async () => {
    mocks.get.mockImplementation((url: string) =>
      Promise.resolve(response(url.endsWith("2") ? 2 : 1)),
    );
    mount();
    expect(await screen.findByText("Synthetic request")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith("/blood-requests?status=pending&page=1");
    expect(screen.getByRole("button", { name: "Be a Volunteer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute(
      "href",
      "/bloodbridge/request/r1",
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument();
  });
  it.each(["medium", "low", "unknown"])(
    "renders %s urgency without offering volunteering for another blood group",
    async (urgency) => {
      mocks.bloodGroup = undefined;
      mocks.get.mockResolvedValue({
        status: 200,
        data: {
          data: { bloodRequests: [{ ...request, urgency, status: "completed" }], totalPages: 1 },
        },
      });
      mount();
      expect(
        await screen.findByText(`${urgency[0].toUpperCase() + urgency.slice(1)} urgency`),
      ).toBeInTheDocument();
      expect(mocks.get).toHaveBeenCalledWith("/blood-requests?status=pending&page=1");
      expect(screen.queryByRole("button", { name: "Be a Volunteer" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    },
  );
  it("combines blood group and status and clears both filters", async () => {
    mount();
    await screen.findByText("Synthetic request");
    await userEvent.click(screen.getByRole("combobox", { name: "Blood group" }));
    await userEvent.click(await screen.findByRole("option", { name: "O+" }));
    await waitFor(() =>
      expect(mocks.get).toHaveBeenLastCalledWith(
        "/blood-requests?bloodGroup=O%2B&status=pending&page=1",
      ),
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Request status" }));
    await userEvent.click(await screen.findByRole("option", { name: "Completed" }));
    await waitFor(() =>
      expect(mocks.get).toHaveBeenLastCalledWith(
        "/blood-requests?bloodGroup=O%2B&status=completed&page=1",
      ),
    );
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(mocks.get).toHaveBeenLastCalledWith("/blood-requests?page=1"));
  });
  it("shows placeholders during loading", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    expect(mount().container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
  it("reports fetch errors", async () => {
    mocks.get.mockRejectedValue(new Error("Offline"));
    mount();
    expect(await screen.findByText("Offline")).toBeInTheDocument();
  });
  it("handles an unexpected response without crashing", async () => {
    mocks.get.mockResolvedValue({ status: 204 });
    const { container } = mount();
    await waitFor(() => expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument());
    expect(screen.queryByText("Synthetic request")).not.toBeInTheDocument();
  });
});
