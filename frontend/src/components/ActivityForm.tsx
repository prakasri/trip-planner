"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextInput, Button, InlineNotification, Stack } from "@carbon/react";
import { ApiError } from "@/lib/apiClient";

const schema = z.object({ description: z.string().min(1, "Required") });
type FormValues = z.infer<typeof schema>;

interface ActivityFormProps {
  onSubmit: (description: string) => Promise<void>;
}

export default function ActivityForm({ onSubmit }: ActivityFormProps) {
  const inputId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function submit(values: FormValues) {
    setServerError(null);
    try {
      await onSubmit(values.description);
      reset();
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack orientation="horizontal" gap={3}>
        <TextInput
          id={inputId}
          labelText=""
          hideLabel
          placeholder="Add an activity…"
          invalid={!!errors.description}
          invalidText={errors.description?.message}
          {...register("description")}
        />
        <Button type="submit" size="sm" disabled={isSubmitting}>
          Add
        </Button>
      </Stack>
      {serverError && <InlineNotification kind="error" title={serverError} hideCloseButton />}
    </form>
  );
}
