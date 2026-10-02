"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextInput, PasswordInput, Button, InlineNotification, Stack } from "@carbon/react";
import { ApiError } from "@/lib/apiClient";

// Mirrors specs/backend-spec.md > Business Logic / Core Rules
const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Must be at least 3 characters")
    .max(30, "Must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, underscores, and hyphens only"),
  password: z.string().min(8, "Must be at least 8 characters"),
});

const loginSchema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof signupSchema>;

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (username: string, password: string) => Promise<void>;
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(mode === "signup" ? signupSchema : loginSchema),
  });

  async function submit(values: FormValues) {
    setServerError(null);
    try {
      await onSubmit(values.username, values.password);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap={5}>
        {serverError && <InlineNotification kind="error" title={serverError} hideCloseButton />}
        <TextInput
          id="username"
          labelText="Username"
          invalid={!!errors.username}
          invalidText={errors.username?.message}
          {...register("username")}
        />
        <PasswordInput
          id="password"
          labelText="Password"
          invalid={!!errors.password}
          invalidText={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" disabled={isSubmitting}>
          {mode === "signup" ? "Sign up" : "Log in"}
        </Button>
      </Stack>
    </form>
  );
}
