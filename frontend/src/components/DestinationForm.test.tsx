import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DestinationForm from "./DestinationForm";

// Real date-range picking (flatpickr) is exercised by the Playwright E2E
// suite, which runs in a real browser — jsdom doesn't reliably reproduce
// flatpickr's calendar/native-input-validation behavior. See e2e/trip-flow.spec.ts.
describe("DestinationForm", () => {
  it("requires a name and a date range before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DestinationForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Add destination" }));

    expect(await screen.findByText("Required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<DestinationForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
