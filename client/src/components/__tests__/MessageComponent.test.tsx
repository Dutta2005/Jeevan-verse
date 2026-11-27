// @vitest-environment jsdom
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MessageList from "../MessageComponent";

describe("chat messages", () => {
  it("renders user text, assistant markdown, timestamps and typing feedback", () => {
    const markdown =
      "## Heading\n\n### Subheading\n\n**Bold** and `code` with [link](https://example.test)\n\n- Bullet\n\n1. Numbered\n\n> Quote\n\n---";
    const { container } = render(
      <MessageList
        messages={[
          { role: "user", content: "Test question", timestamp: "2026-01-01T12:00:00Z" },
          { role: "assistant", content: markdown, timestamp: "2026-01-01T12:01:00Z" },
        ]}
        isLoading
        messagesEndRef={createRef()}
      />,
    );
    expect(screen.getByText("Test question")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Heading" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Subheading" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "link" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(container.querySelector("blockquote")).toHaveTextContent("Quote");
    expect(container.querySelector("hr")).toBeInTheDocument();
    expect(container.querySelector("code")).toHaveTextContent("code");
  });

  it("opens and closes image attachments and links PDF attachments", () => {
    render(
      <MessageList
        messages={[
          {
            role: "user",
            content: "Test upload",
            attachments: [
              { type: "image", url: "https://example.test/image.png" },
              { type: "pdf", url: "https://example.test/file.pdf" },
              { type: "pdf", url: "https://example.test/named.pdf", originalName: "named.pdf" },
            ],
          },
        ]}
        isLoading={false}
        messagesEndRef={createRef()}
      />,
    );
    fireEvent.click(screen.getByAltText("Prescription"));
    expect(screen.getByAltText("Full prescription")).toHaveAttribute(
      "src",
      "https://example.test/image.png",
    );
    fireEvent.click(screen.getByAltText("Full prescription"));
    expect(screen.queryByAltText("Full prescription")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Prescription.pdf" })).toHaveAttribute(
      "href",
      "https://example.test/file.pdf",
    );
    expect(screen.getByRole("link", { name: "named.pdf" })).toBeInTheDocument();
  });

  it.each(["image", "pdf"] as const)(
    "shows parsed prescription analysis after a %s upload",
    (type) => {
      render(
        <MessageList
          messages={[
            {
              role: "user",
              content: "Upload",
              attachments: [
                {
                  type,
                  url: "https://example.test/file",
                  analysis: JSON.stringify({ medications: [{ name: "Synthetic medication" }] }),
                },
              ],
            },
            { role: "assistant", content: "Synthetic response" },
          ]}
          isLoading={false}
          messagesEndRef={createRef()}
        />,
      );
      expect(screen.getByText("Synthetic medication")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "View prescription" }) !== null).toBe(
        type === "image",
      );
    },
  );

  it.each(["invalid json", "null", "{}"])("ignores unusable analysis: %s", (analysis) => {
    render(
      <MessageList
        messages={[
          {
            role: "user",
            content: "Upload",
            attachments: [{ type: "pdf", url: "https://example.test/file", analysis }],
          },
          { role: "assistant", content: "Response" },
        ]}
        isLoading={false}
        messagesEndRef={createRef()}
      />,
    );
    expect(screen.queryByText("Prescription Analysis")).not.toBeInTheDocument();
    expect(screen.getByText("Response")).toBeInTheDocument();
  });
  it("handles an assistant-first conversation and empty user attachments", () => {
    render(
      <MessageList
        messages={[
          { role: "assistant", content: "Welcome" },
          { role: "user", content: "Hello", attachments: [] },
        ]}
        isLoading={false}
        messagesEndRef={createRef()}
      />,
    );
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
