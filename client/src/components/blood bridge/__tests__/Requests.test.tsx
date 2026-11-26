// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Requests from "../Requests";

const mocks = vi.hoisted(() => ({ get: vi.fn(), bloodGroup: "O+" as string | undefined }));
vi.mock("../../../api/api", () => ({ api: { get: mocks.get } }));
vi.mock("react-redux", () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { user: { bloodGroup: mocks.bloodGroup } } }),
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
      <Requests />
    </MemoryRouter>,
  );

describe("blood request list", () => {
  it("defaults to the user's blood group and paginates both ways", async () => {
    mocks.get.mockImplementation((url: string) =>
      Promise.resolve(response(url.endsWith("2") ? 2 : 1)),
    );
    mount();
    expect(await screen.findByText("Synthetic request")).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith("/blood-requests/blood-group?bloodGroup=O+&page=1");
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
      expect(await screen.findByText(`${urgency.toUpperCase()}`)).toBeInTheDocument();
      expect(mocks.get).toHaveBeenCalledWith("/blood-requests?page=1");
      expect(screen.queryByRole("button", { name: "Be a Volunteer" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    },
  );
  it("changes blood group, status and sort filters", async () => {
    mount();
    await screen.findByText("Synthetic request");
    await userEvent.click(screen.getAllByRole("combobox")[0]!);
    await userEvent.click(await screen.findByRole("option", { name: "All Groups" }));
    await waitFor(() => expect(mocks.get).toHaveBeenLastCalledWith("/blood-requests?page=1"));
    await userEvent.click(screen.getAllByRole("combobox")[1]!);
    await userEvent.click(await screen.findByRole("option", { name: "Pending" }));
    await waitFor(() =>
      expect(mocks.get).toHaveBeenLastCalledWith("/blood-requests/status?status=pending&page=1"),
    );
    await userEvent.click(screen.getAllByRole("combobox")[2]!);
    await userEvent.click(await screen.findByRole("option", { name: "Oldest" }));
    await screen.findByText("Synthetic request");
    expect(screen.getAllByRole("combobox")[2]).toHaveTextContent("Oldest");
  });
  it("shows a spinner during loading", () => {
    mocks.get.mockReturnValue(new Promise(() => {}));
    expect(mount().container.querySelector(".animate-spin")).toBeInTheDocument();
  });
  it("reports fetch errors", async () => {
    mocks.get.mockRejectedValue(new Error("Offline"));
    mount();
    expect(await screen.findByText("Offline")).toBeInTheDocument();
  });
  it("handles an unexpected response without crashing", async () => {
    mocks.get.mockResolvedValue({ status: 204 });
    const { container } = mount();
    await waitFor(() => expect(container.querySelector(".animate-spin")).not.toBeInTheDocument());
    expect(screen.queryByText("Synthetic request")).not.toBeInTheDocument();
  });
});
