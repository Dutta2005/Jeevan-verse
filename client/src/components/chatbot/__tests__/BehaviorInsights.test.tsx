// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BehaviorInsights from "../BehaviorInsights";

const data = {
  totalSessions: 2,
  totalMessages: 12,
  averageSessionLength: 6,
  consultationFrequency: "moderate",
  frequentTopics: [{ topic: "sleep", count: 3 }],
  moodDistribution: { positive: 1, unknown: 1 },
  recentActivity: [],
};

describe("behavior insights", () => {
  it("shows loading feedback before data is available", () => {
    render(<BehaviorInsights data={null} isLoading onClose={vi.fn()} />);
    expect(screen.getByText("Analyzing your behavior patterns...")).toBeInTheDocument();
  });
  it("renders nothing when there is no result", () => {
    const { container } = render(
      <BehaviorInsights data={null} isLoading={false} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
  it("shows aggregate topics and mood percentages, and closes only from outside or the close button", () => {
    const close = vi.fn();
    const { container } = render(
      <BehaviorInsights data={data} isLoading={false} onClose={close} />,
    );
    expect(screen.getByText("moderate")).toBeInTheDocument();
    expect(screen.getByText("sleep")).toBeInTheDocument();
    expect(screen.getAllByText("50%")).toHaveLength(2);
    fireEvent.click(screen.getByText("Consultation Frequency"));
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(container.firstChild!);
    expect(close).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button"));
    expect(close).toHaveBeenCalledTimes(2);
  });
  it("shows a first-use message for an empty history and handles an unknown frequency", () => {
    render(
      <BehaviorInsights
        data={{
          ...data,
          totalSessions: 0,
          frequentTopics: [],
          moodDistribution: {},
          consultationFrequency: "unknown",
        }}
        isLoading={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("No data yet")).toBeInTheDocument();
    expect(screen.getByText("unknown")).toHaveClass("text-gray-400");
    expect(screen.queryByText("Frequently Discussed Topics")).not.toBeInTheDocument();
  });
  it("avoids dividing by zero for mood counts of zero", () => {
    render(
      <BehaviorInsights
        data={{ ...data, moodDistribution: { neutral: 0 } }}
        isLoading={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText("Mood Distribution")).not.toBeInTheDocument();
  });
});
