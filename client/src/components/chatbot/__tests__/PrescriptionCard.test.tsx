// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PrescriptionCard from "../PrescriptionCard";

describe("prescription analysis card", () => {
  it("renders the returned fields, expands, collapses, and toggles the source image", async () => {
    const user = userEvent.setup();
    render(
      <PrescriptionCard
        imageUrl="https://example.test/prescription.png"
        analysis={{
          diagnosis: "Synthetic analysis",
          medications: [
            {
              name: "Test medication",
              dosage: "Test dose",
              frequency: "Test frequency",
              duration: "Test duration",
            },
          ],
          doctorName: "Test clinician",
          date: "2026-01-01",
          notes: "Synthetic notes",
        }}
      />,
    );
    expect(screen.getByText("Synthetic analysis")).toBeInTheDocument();
    expect(screen.getByText("Test medication")).toBeInTheDocument();
    expect(screen.getByText(/Test dose/)).toBeInTheDocument();
    expect(screen.getByText(/Test frequency/)).toBeInTheDocument();
    expect(screen.getByText(/Test duration/)).toBeInTheDocument();
    expect(screen.getByText("Test clinician")).toBeInTheDocument();
    expect(screen.getByText("Synthetic notes")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View prescription" }));
    expect(screen.getByAltText("Prescription")).toHaveAttribute(
      "src",
      "https://example.test/prescription.png",
    );
    await user.click(screen.getByRole("button", { name: "Hide prescription" }));
    expect(screen.queryByAltText("Prescription")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Prescription Analysis" }));
    expect(screen.queryByText("Test medication")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Prescription Analysis" }));
    expect(screen.getByText("Test medication")).toBeInTheDocument();
  });

  it.each([undefined, "", "Not readable", "Not found", "Unable to analyze"])(
    "hides missing or unreadable fields: %s",
    (value) => {
      render(
        <PrescriptionCard
          analysis={{
            medications: [
              { name: "Test medication", dosage: value, frequency: value, duration: value },
            ],
            diagnosis: value,
            doctorName: value,
            date: value,
            notes: value,
          }}
        />,
      );
      expect(screen.queryByText("Diagnosis")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "View prescription" })).not.toBeInTheDocument();
      if (value) expect(screen.queryByText(value)).not.toBeInTheDocument();
    },
  );

  it("handles an empty medication list", () => {
    render(<PrescriptionCard analysis={{ medications: [] }} />);
    expect(screen.queryByText("Medications")).not.toBeInTheDocument();
  });
});
