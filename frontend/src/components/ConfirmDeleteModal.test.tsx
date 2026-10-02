import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

describe("ConfirmDeleteModal", () => {
  it("is not visible when open=false", () => {
    // Carbon's Modal always renders its content (visibility is CSS-driven
    // via the "is-visible" class, not conditional mounting), so assert on
    // that class rather than DOM presence.
    const { container } = render(
      <ConfirmDeleteModal open={false} heading="Delete it?" onConfirm={vi.fn()} onCancel={vi.fn()}>
        <p>Body</p>
      </ConfirmDeleteModal>,
    );
    expect(container.querySelector(".cds--modal")).not.toHaveClass("is-visible");
  });

  it("is visible when open=true", () => {
    const { container } = render(
      <ConfirmDeleteModal open heading="Delete it?" onConfirm={vi.fn()} onCancel={vi.fn()}>
        <p>Body</p>
      </ConfirmDeleteModal>,
    );
    expect(container.querySelector(".cds--modal")).toHaveClass("is-visible");
  });

  it("calls onConfirm when Delete is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDeleteModal open heading="Delete it?" onConfirm={onConfirm} onCancel={vi.fn()}>
        <p>Body</p>
      </ConfirmDeleteModal>,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ConfirmDeleteModal open heading="Delete it?" onConfirm={vi.fn()} onCancel={onCancel}>
        <p>Body</p>
      </ConfirmDeleteModal>,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
