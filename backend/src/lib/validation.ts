import { z } from "zod";

// Thresholds match specs/backend-spec.md > Business Logic / Core Rules
export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_-]+$/, "username may only contain letters, numbers, underscores, and hyphens");

export const passwordSchema = z.string().min(8);

export const signupSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const tripTypeSchema = z.enum(["solo", "couple", "family", "group"]);

export const createTripSchema = z.object({
  name: z.string().min(1),
  tripType: tripTypeSchema,
});

export const updateTripSchema = createTripSchema.partial();

export const createDestinationSchema = z
  .object({
    name: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const updateDestinationSchema = z.object({
  name: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const createActivitySchema = z.object({
  dayNumber: z.number().int().min(1),
  description: z.string().min(1),
});

export const updateActivitySchema = createActivitySchema.partial();
