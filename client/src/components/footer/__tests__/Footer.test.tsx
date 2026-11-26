// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Footer from "../Footer";

describe("Footer", () => {
  it("renders contact, social, and legal links", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Empowering healthcare/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /jeevanverse247@gmail.com/i })).toHaveAttribute(
      "href",
      "mailto:jeevanverse247@gmail.com",
    );
    expect(screen.getByRole("link", { name: "Facebook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/");
    expect(screen.getByText(/JeevanVerse\. All rights reserved\./)).toBeInTheDocument();
  });
});
