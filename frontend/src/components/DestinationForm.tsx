"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { TextInput, DatePicker, DatePickerInput, Button, InlineNotification, Stack } from "@carbon/react";
import { ApiError } from "@/lib/apiClient";

const schema = z.object({
  name: z.string().min(1, "Required"),
  dateRange: z
    .array(z.date())
    .length(2, "Select a start and end date"),
});

type FormValues = z.infer<typeof schema>;

export interface DestinationFormValues {
  name: string;
  startDate: string;
  endDate: string;
}

interface DestinationFormProps {
  onSubmit: (values: DestinationFormValues) => Promise<void>;
  onCancel: () => void;
}

export default function DestinationForm({ onSubmit, onCancel }: DestinationFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function submit(values: FormValues) {
    setServerError(null);
    try {
      await onSubmit({
        name: values.name,
        startDate: format(values.dateRange[0], "yyyy-MM-dd"),
        endDate: format(values.dateRange[1], "yyyy-MM-dd"),
      });
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Stack gap={5}>
        {serverError && <InlineNotification kind="error" title={serverError} hideCloseButton />}
        <TextInput
          id="destination-name"
          labelText="Destination name"
          invalid={!!errors.name}
          invalidText={errors.name?.message}
          {...register("name")}
        />
        <Controller
          name="dateRange"
          control={control}
          render={({ field }) => (
            <DatePicker
              datePickerType="range"
              dateFormat="Y-m-d"
              onChange={(dates: Date[]) => field.onChange(dates)}
            >
              <DatePickerInput
                id="destination-start"
                labelText="Start date"
                placeholder="yyyy-mm-dd"
                pattern="\d{4}-\d{2}-\d{2}"
              />
              <DatePickerInput
                id="destination-end"
                labelText="End date"
                placeholder="yyyy-mm-dd"
                pattern="\d{4}-\d{2}-\d{2}"
              />
            </DatePicker>
          )}
        />
        {errors.dateRange && <InlineNotification kind="error" title={errors.dateRange.message as string} hideCloseButton />}
        <Stack orientation="horizontal" gap={3}>
          <Button type="submit" disabled={isSubmitting}>
            Add destination
          </Button>
          <Button kind="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
