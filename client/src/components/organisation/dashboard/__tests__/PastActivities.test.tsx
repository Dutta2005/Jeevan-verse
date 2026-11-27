// @vitest-environment jsdom

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authReducer, { loginOrganization } from "../../../../store/authSlice";
import PastActivities from "../PastActivities";

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), delete: vi.fn() }));
vi.mock("../../../../api/api", () => ({ api: apiMocks }));

const posts = [
  {
    _id: "post-1",
    title: "Blood donation camp",
    content: "Community camp this weekend",
    tags: "Blood Drive",
    thumbnail: "https://example.test/camp.png",
    createdAt: "2026-11-20T10:00:00.000Z",
  },
  {
    _id: "post-2",
    title: "Health education",
    content: "Learn about prevention",
    tags: "",
    thumbnail: "",
    createdAt: "2026-11-18T10:00:00.000Z",
  },
];

function renderActivities(authenticated = true) {
  const store = configureStore({ reducer: { auth: authReducer } });
  if (authenticated) {
    store.dispatch(loginOrganization({ _id: "org-1", name: "City Clinic" }));
  }

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <PastActivities />
      </MemoryRouter>
    </Provider>,
  );
}

describe("PastActivities", () => {
  beforeEach(() => {
    apiMocks.get.mockReset();
    apiMocks.delete.mockReset();
  });

  it("shows a loader while activities are being fetched", () => {
    apiMocks.get.mockReturnValue(new Promise(() => {}));
    const { container } = renderActivities();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders the empty state after a successful empty response", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: [] } });
    renderActivities();

    expect(await screen.findByText("No activities found")).toBeInTheDocument();
    expect(apiMocks.get).toHaveBeenCalledWith("/org-posts/organization/org-1");
  });

  it("renders post details, optional tags and images, links, and dates", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: posts } });
    renderActivities();

    expect(await screen.findByRole("heading", { name: "Blood donation camp" })).toBeInTheDocument();
    expect(screen.getByText("Blood Drive")).toBeInTheDocument();
    expect(screen.getByAltText("Blood donation camp")).toHaveAttribute(
      "src",
      "https://example.test/camp.png",
    );
    expect(screen.getByText("Community camp this weekend")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "View Post" })[0]).toHaveAttribute(
      "href",
      "/post/post-1",
    );
    expect(screen.getByText("Nov 20, 2026")).toBeInTheDocument();
    expect(screen.queryByAltText("Health education")).not.toBeInTheDocument();
  });

  it("shows a readable load error", async () => {
    apiMocks.get.mockRejectedValue(new Error("Activities are unavailable"));
    renderActivities();

    expect(await screen.findByText("Activities are unavailable")).toBeInTheDocument();
    expect(screen.queryByText("No activities found")).not.toBeInTheDocument();
  });

  it("refreshes the list after deleting a post", async () => {
    const user = userEvent.setup();
    apiMocks.get.mockResolvedValueOnce({ data: { data: [posts[0]] } }).mockResolvedValueOnce({
      data: { data: [] },
    });
    apiMocks.delete.mockResolvedValue({});
    renderActivities();

    expect(await screen.findByRole("heading", { name: "Blood donation camp" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Actions for Blood donation camp" }));
    await user.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => expect(apiMocks.delete).toHaveBeenCalledWith("/org-posts/delete/post-1"));
    expect(await screen.findByText("No activities found")).toBeInTheDocument();
    expect(apiMocks.get).toHaveBeenCalledTimes(2);
  });

  it("does not fetch without an organization id", () => {
    apiMocks.get.mockReturnValue(new Promise(() => {}));
    const { container } = renderActivities(false);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    expect(apiMocks.get).not.toHaveBeenCalled();
  });

  it("keeps the activity and explains a failed deletion", async () => {
    apiMocks.get.mockResolvedValue({ data: { data: [posts[0]] } });
    apiMocks.delete.mockRejectedValue(new Error("Delete failed"));
    renderActivities();
    await screen.findByRole("heading", { name: "Blood donation camp" });
    await userEvent.click(screen.getByRole("button", { name: "Actions for Blood donation camp" }));
    await userEvent.click(await screen.findByRole("button", { name: "Delete" }));
    expect(await screen.findByText("Delete failed")).toBeInTheDocument();
    expect(apiMocks.get).toHaveBeenCalledTimes(1);
  });
});
