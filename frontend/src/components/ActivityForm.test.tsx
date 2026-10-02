import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActivityForm from "./ActivityForm";

describe("ActivityForm", () => {
  it("submits the entered description and clears the field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ActivityForm onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText("Add an activity…");
    await user.type(input, "Visit Senso-ji Temple");
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("Visit Senso-ji Temple"));
    await waitFor(() => expect(input).toHaveValue(""));
  });

  it("does not submit an empty description", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ActivityForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
