import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TripForm from "./TripForm";

describe("TripForm", () => {
  it("submits the entered name and selected trip type", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TripForm submitLabel="Create trip" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Trip name"), "Spring in Japan");
    await user.click(screen.getByRole("combobox", { name: "Trip type" }));
    await user.click(screen.getByText("Couple"));
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ name: "Spring in Japan", tripType: "couple" }),
    );
  });

  it("does not submit without a trip name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TripForm submitLabel="Create trip" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("combobox", { name: "Trip type" }));
    await user.click(screen.getByText("Solo"));
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(await screen.findByText("Required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit without a trip type selected", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TripForm submitLabel="Create trip" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Trip name"), "Spring in Japan");
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(await screen.findByText("Trip type is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("pre-fills defaultValues for editing", () => {
    render(
      <TripForm
        submitLabel="Save"
        defaultValues={{ name: "Existing trip", tripType: "family" }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Trip name")).toHaveValue("Existing trip");
    expect(screen.getByText("Family")).toBeInTheDocument();
  });
});
