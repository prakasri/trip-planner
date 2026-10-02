"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextInput, Dropdown, Button, InlineNotification, Stack } from "@carbon/react";
import { ApiError } from "@/lib/apiClient";
import type { TripType } from "@/lib/types";

const tripTypes: { id: TripType; label: string }[] = [
  { id: "solo", label: "Solo" },
  { id: "couple", label: "Couple" },
  { id: "family", label: "Family" },
  { id: "group", label: "Group of friends" },
];

const schema = z.object({
  name: z.string().min(1, "Required"),
  tripType: z.enum(["solo", "couple", "family", "group"]),
});

type FormValues = z.infer<typeof schema>;

interface TripFormProps {
  defaultValues?: Partial<FormValues>;
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<void>;
}

export default function TripForm({ defaultValues, submitLabel, onSubmit }: TripFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  async function submit(values: FormValues) {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap={5}>
        {serverError && <InlineNotification kind="error" title={serverError} hideCloseButton />}
        <TextInput
          id="trip-name"
          labelText="Trip name"
          invalid={!!errors.name}
          invalidText={errors.name?.message}
          {...register("name")}
        />
        <Controller
          name="tripType"
          control={control}
          render={({ field }) => (
            <Dropdown
              id="trip-type"
              titleText="Trip type"
              label="Select a trip type"
              items={tripTypes}
              itemToString={(item) => item?.label ?? ""}
              selectedItem={tripTypes.find((t) => t.id === field.value) ?? null}
              onChange={({ selectedItem }) => field.onChange(selectedItem?.id)}
            />
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
