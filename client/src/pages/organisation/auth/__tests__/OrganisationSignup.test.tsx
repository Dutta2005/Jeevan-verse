// @vitest-environment jsdom
import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrganisationSignup from "../OrganisationSignup";
import { selectOption } from "../../../../test/selectOption";

vi.mock("@/components/auth/AuthLayout", () => ({
  AuthLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const mocks = vi.hoisted(() => ({ post: vi.fn(), navigate: vi.fn(), toast: vi.fn() }));
vi.mock("../../../../api/api", () => ({ api: { post: mocks.post } }));
vi.mock("../../../../hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => mocks.navigate,
}));
beforeEach(() => vi.resetAllMocks());
const mount = () =>
  render(
    <MemoryRouter>
      <OrganisationSignup />
    </MemoryRouter>,
  );
const submit = () =>
  fireEvent.submit(screen.getByRole("button", { name: "Register organization" }).closest("form")!);
async function fill(website = "") {
  for (const [placeholder, value] of [
    ["Enter organization name", "Test Organization"],
    ["Enter email", "org@example.test"],
    ["Enter password", "TestPassword1"],
    ["Brief description of your organization", "Synthetic organization description"],
    ["https://www.yourorganization.com", website],
  ])
    fireEvent.change(screen.getByPlaceholderText(placeholder!), { target: { value } });
  await selectOption(0, "NGO");
}

describe("organization registration", () => {
  it("validates required fields before making a request", async () => {
    mount();
    submit();
    expect(
      await screen.findByText("Organization name must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(screen.getByText("Please select an organization type")).toBeInTheDocument();
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    expect(screen.getByText("Description must be at least 10 characters")).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it.each(["", "https://example.test"])("submits valid data with website '%s'", async (website) => {
    mocks.post.mockResolvedValue({ status: 200 });
    mount();
    await fill(website);
    submit();
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/signin"));
    expect(mocks.post).toHaveBeenCalledWith("/organizations/register", {
      name: "Test Organization",
      email: "org@example.test",
      password: "TestPassword1",
      type: "ngo",
      description: "Synthetic organization description",
      website: website || undefined,
    });
  });
  it("validates website URLs", async () => {
    mount();
    await fill("invalid");
    submit();
    expect(await screen.findByText("Invalid website URL")).toBeInTheDocument();
    expect(mocks.post).not.toHaveBeenCalled();
  });
  it.each(["axios", "network", "unexpected"])(
    "handles registration %s responses",
    async (result) => {
      if (result === "axios")
        mocks.post.mockRejectedValue({ isAxiosError: true, response: { statusText: "Conflict" } });
      else if (result === "network") mocks.post.mockRejectedValue(new Error("Offline"));
      else mocks.post.mockResolvedValue({ status: 204 });
      mount();
      await fill();
      submit();
      await waitFor(() => expect(mocks.post).toHaveBeenCalled());
      if (result !== "unexpected")
        await waitFor(() =>
          expect(mocks.toast).toHaveBeenCalledWith(
            expect.objectContaining({
              title: "Registration Failed",
              description:
                result === "axios"
                  ? "Conflict"
                  : "An error occurred during registration. Please try again.",
            }),
          ),
        );
      expect(mocks.navigate).not.toHaveBeenCalled();
    },
  );
});
