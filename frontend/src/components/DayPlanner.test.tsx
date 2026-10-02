import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DayPlanner from "./DayPlanner";
import type { Activity } from "@/lib/types";

const activities: Activity[] = [
  { id: "a1", dayNumber: 1, description: "Arrive", createdAt: "", updatedAt: "" },
  { id: "a2", dayNumber: 2, description: "Explore", createdAt: "", updatedAt: "" },
];

describe("DayPlanner", () => {
  it("renders one AccordionItem per day and groups activities by dayNumber", async () => {
    const user = userEvent.setup();
    render(
      <DayPlanner dayCount={3} activities={activities} onAddActivity={vi.fn()} onDeleteActivity={vi.fn()} />,
    );

    // Carbon hides closed accordion panels via CSS classes (no inline style
    // or `hidden` attribute, and jsdom doesn't apply the real stylesheet),
    // so open/closed state is asserted via aria-expanded, not visibility.
    const day1 = screen.getByRole("button", { name: "Day 1" });
    const day2 = screen.getByRole("button", { name: "Day 2" });
    const day3 = screen.getByRole("button", { name: "Day 3" });
    expect(day1).toHaveAttribute("aria-expanded", "true");
    expect(day2).toHaveAttribute("aria-expanded", "false");
    expect(day3).toHaveAttribute("aria-expanded", "false");

    // Activities are grouped under the correct day regardless of open state
    // (Carbon renders all panel content; CSS alone controls the collapse).
    expect(screen.getByText("Arrive")).toBeInTheDocument();
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("No activities yet.")).toBeInTheDocument(); // Day 3 has none

    await user.click(day2);
    expect(day2).toHaveAttribute("aria-expanded", "true");

    await user.click(day3);
    expect(day3).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onAddActivity with the correct dayNumber", async () => {
    const user = userEvent.setup();
    const onAddActivity = vi.fn().mockResolvedValue(undefined);
    render(
      <DayPlanner
        dayCount={2}
        activities={activities}
        onAddActivity={onAddActivity}
        onDeleteActivity={vi.fn()}
      />,
    );

    const [day1Input] = screen.getAllByPlaceholderText("Add an activity…");
    await user.type(day1Input, "Check into hotel");
    await user.click(screen.getAllByRole("button", { name: "Add" })[0]);

    expect(onAddActivity).toHaveBeenCalledWith(1, "Check into hotel");
  });

  it("calls onDeleteActivity with the activity's id", async () => {
    const user = userEvent.setup();
    const onDeleteActivity = vi.fn().mockResolvedValue(undefined);
    render(
      <DayPlanner dayCount={1} activities={activities} onAddActivity={vi.fn()} onDeleteActivity={onDeleteActivity} />,
    );

    await user.click(screen.getByRole("button", { name: "Delete Arrive" }));
    expect(onDeleteActivity).toHaveBeenCalledWith("a1");
  });
});
