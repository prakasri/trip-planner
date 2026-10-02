import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TripCard from "./TripCard";
import type { TripListItem } from "@/lib/types";

const trip: TripListItem = {
  id: "trip-1",
  name: "Spring in Japan",
  tripType: "couple",
  destinationCount: 2,
  startDate: "2027-04-01",
  endDate: "2027-04-10",
  createdAt: "",
};

describe("TripCard", () => {
  it("calls onOpen when clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<TripCard trip={trip} onOpen={onOpen} onDelete={vi.fn()} />);

    await user.click(screen.getByText("Spring in Japan"));
    expect(onOpen).toHaveBeenCalled();
  });

  it("asks for confirmation before deleting, and does not call onOpen", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<TripCard trip={trip} onOpen={onOpen} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Delete Spring in Japan" }));
    expect(onOpen).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText('Delete "Spring in Japan"?')).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalled();
  });

  it("shows a fallback when there are no destinations yet", () => {
    render(
      <TripCard
        trip={{ ...trip, destinationCount: 0, startDate: null, endDate: null }}
        onOpen={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(/No destinations yet/)).toBeInTheDocument();
  });
});
