// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PostForm from "../PostForm";
import { selectOption } from "../../../../test/selectOption";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  navigate: vi.fn(),
  id: undefined as string | undefined,
}));
vi.mock("../../../../api/api", () => ({
  api: { get: mocks.get, post: mocks.post, patch: mocks.patch },
}));
vi.mock("react-router", () => ({
  useParams: () => ({ id: mocks.id }),
  useNavigate: () => mocks.navigate,
}));
beforeEach(() => {
  vi.resetAllMocks();
  mocks.id = undefined;
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const fill = () => {
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Synthetic title" } });
  fireEvent.change(screen.getByLabelText("Content"), { target: { value: "Synthetic content" } });
};

describe("organization post form", () => {
  it("validates required content without calling the API", async () => {
    render(<PostForm />);
    fireEvent.submit(screen.getByRole("button", { name: "Create Post" }).closest("form")!);
    expect(await screen.findByRole("alert")).toHaveTextContent("Title and content are required");
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it("creates a multipart post with a thumbnail and tag", async () => {
    vi.stubGlobal(
      "URL",
      Object.assign(class extends URL {}, { createObjectURL: () => "blob:preview" }),
    );
    mocks.post.mockResolvedValue({ data: { data: { _id: "p1" } } });
    const { container } = render(<PostForm />);
    fill();
    await selectOption(0, "Event");
    const file = new File(["test"], "test.png", { type: "image/png" });
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [] } });
    await userEvent.upload(container.querySelector<HTMLInputElement>('input[type="file"]')!, file);
    expect(screen.getByAltText("Thumbnail Preview")).toHaveAttribute("src", "blob:preview");
    await userEvent.click(screen.getByRole("button", { name: "Create Post" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/organisation/post/p1"));
    const payload = mocks.post.mock.calls[0]![1] as FormData;
    expect(payload.get("title")).toBe("Synthetic title");
    expect(payload.get("content")).toBe("Synthetic content");
    expect(payload.get("tags")).toBe("Event");
    expect(payload.get("thumbnail")).toBe(file);
  });
  it.each(["Event", "unknown"])(
    "loads an existing post with tag %s and updates it",
    async (tags) => {
      mocks.id = "p1";
      mocks.get.mockResolvedValue({
        data: {
          data: { title: "Original title", content: "Original content", tags, thumbnail: null },
        },
      });
      mocks.patch.mockResolvedValue({});
      render(<PostForm />);
      await screen.findByDisplayValue("Original title");
      fill();
      await userEvent.click(screen.getByRole("button", { name: "Update Post" }));
      await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/organisation"));
      expect(mocks.patch).toHaveBeenCalledWith("/org-posts/edit/p1", {
        title: "Synthetic title",
        content: "Synthetic content",
        tags: tags === "Event" ? "Event" : "General",
      });
    },
  );
  it("submits without a thumbnail", async () => {
    mocks.post.mockResolvedValue({ data: { data: { _id: "p1" } } });
    render(<PostForm />);
    fill();
    await userEvent.click(screen.getByRole("button", { name: "Create Post" }));
    await waitFor(() => expect(mocks.post).toHaveBeenCalled());
    expect((mocks.post.mock.calls[0]![1] as FormData).has("thumbnail")).toBe(false);
  });
  it("explains fetch failures", async () => {
    mocks.id = "p1";
    mocks.get.mockRejectedValue(new Error("Offline"));
    render(<PostForm />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
  });
  it("preserves form input after a submit failure", async () => {
    mocks.post.mockRejectedValue(new Error("Offline"));
    render(<PostForm />);
    fill();
    await userEvent.click(screen.getByRole("button", { name: "Create Post" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Offline");
    expect(screen.getByLabelText("Title")).toHaveValue("Synthetic title");
  });
  it("navigates on cancellation", async () => {
    render(<PostForm />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/past-activities");
  });
});
