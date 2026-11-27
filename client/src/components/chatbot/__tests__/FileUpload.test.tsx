// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import FileUpload from "../FileUpload";

afterEach(() => vi.restoreAllMocks());
const props = () => ({
  onFileSelect: vi.fn(),
  onClearFile: vi.fn(),
  selectedFile: null,
  isUploading: false,
});

describe("prescription file selection", () => {
  it("opens the picker, accepts a file, and resets it for reselection", async () => {
    const callbacks = props();
    const { container } = render(<FileUpload {...callbacks} />);
    const input = container.querySelector<HTMLInputElement>("input[type=file]")!;
    const click = vi.spyOn(input, "click");
    await userEvent.click(screen.getByTitle("Upload prescription (Image or PDF)"));
    expect(click).toHaveBeenCalled();
    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    await userEvent.upload(input, file);
    expect(callbacks.onFileSelect).toHaveBeenCalledWith(file);
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { files: [] } });
    expect(callbacks.onFileSelect).toHaveBeenCalledTimes(1);
  });

  it.each(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/jpg"])(
    "accepts a dropped %s file",
    (type) => {
      const callbacks = props();
      const { container } = render(<FileUpload {...callbacks} />);
      const dropzone = container.firstChild!;
      fireEvent.dragOver(dropzone);
      expect(screen.getByText("Drop prescription here")).toBeInTheDocument();
      const file = new File(["test"], "test", { type });
      fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
      expect(callbacks.onFileSelect).toHaveBeenCalledWith(file);
    },
  );

  it("dismisses the drag overlay and ignores unsupported or empty drops", async () => {
    const callbacks = props();
    const { container } = render(<FileUpload {...callbacks} />);
    fireEvent.dragOver(container.firstChild!);
    fireEvent.dragLeave(container.firstChild!);
    await waitFor(() =>
      expect(screen.queryByText("Drop prescription here")).not.toBeInTheDocument(),
    );
    fireEvent.drop(container.firstChild!, {
      dataTransfer: { files: [new File(["test"], "test.txt", { type: "text/plain" })] },
    });
    fireEvent.drop(container.firstChild!, { dataTransfer: { files: [] } });
    expect(callbacks.onFileSelect).not.toHaveBeenCalled();
  });

  it.each([
    [10, "10 B"],
    [2048, "2.0 KB"],
    [1048576, "1.0 MB"],
  ] as const)("formats a %i byte preview and clears it", async (size, label) => {
    const callbacks = props();
    const file = new File([new Uint8Array(size)], "test.pdf", { type: "application/pdf" });
    render(<FileUpload {...callbacks} selectedFile={file} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button")[1]!);
    expect(callbacks.onClearFile).toHaveBeenCalledTimes(1);
  });

  it("renders an image preview and disables the picker during upload", () => {
    const createObjectURL = vi.fn(() => "blob:preview");
    vi.stubGlobal("URL", Object.assign(class extends URL {}, { createObjectURL }));
    const file = new File(["test"], "test.png", { type: "image/png" });
    render(<FileUpload {...props()} selectedFile={file} isUploading />);
    expect(screen.getByAltText("Preview")).toHaveAttribute("src", "blob:preview");
    expect(screen.getByTitle("Upload prescription (Image or PDF)")).toBeDisabled();
    expect(screen.getByText("Analyzing...")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
