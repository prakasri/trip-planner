import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthForm from "./AuthForm";
import { ApiError } from "@/lib/apiClient";

describe("AuthForm", () => {
  it("calls onSubmit with the entered credentials", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AuthForm mode="login" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Username"), "jsmith");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("jsmith", "password123"));
  });

  it("rejects a signup password under 8 characters without calling onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuthForm mode="signup" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Username"), "jsmith");
    await user.type(screen.getByLabelText("Password"), "short1");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects a signup username with disallowed characters", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuthForm mode="signup" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Username"), "js mith!");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByText(/letters, numbers, underscores, and hyphens only/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows the server error message when onSubmit throws an ApiError", async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError({ code: "INVALID_CREDENTIALS", message: "Username or password is incorrect" }));
    render(<AuthForm mode="login" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Username"), "jsmith");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Username or password is incorrect")).toBeInTheDocument();
  });
});
