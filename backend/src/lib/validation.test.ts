import { describe, it, expect } from "vitest";
import {
  usernameSchema,
  passwordSchema,
  createDestinationSchema,
  createActivitySchema,
  tripTypeSchema,
} from "./validation";

describe("usernameSchema", () => {
  it("accepts a valid username", () => {
    expect(usernameSchema.safeParse("jsmith_01").success).toBe(true);
  });
  it("rejects too short", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
  });
  it("rejects too long", () => {
    expect(usernameSchema.safeParse("a".repeat(31)).success).toBe(false);
  });
  it("rejects disallowed characters", () => {
    expect(usernameSchema.safeParse("js mith!").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("rejects under 8 characters", () => {
    expect(passwordSchema.safeParse("short1").success).toBe(false);
  });
  it("accepts 8+ characters", () => {
    expect(passwordSchema.safeParse("password123").success).toBe(true);
  });
});

describe("tripTypeSchema", () => {
  it("accepts the four defined values", () => {
    for (const t of ["solo", "couple", "family", "group"]) {
      expect(tripTypeSchema.safeParse(t).success).toBe(true);
    }
  });
  it("rejects anything else", () => {
    expect(tripTypeSchema.safeParse("honeymoon").success).toBe(false);
  });
});

describe("createDestinationSchema", () => {
  it("accepts endDate on or after startDate", () => {
    const result = createDestinationSchema.safeParse({
      name: "Tokyo",
      startDate: "2027-04-01",
      endDate: "2027-04-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects endDate before startDate", () => {
    const result = createDestinationSchema.safeParse({
      name: "Tokyo",
      startDate: "2027-04-04",
      endDate: "2027-04-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("createActivitySchema", () => {
  it("rejects dayNumber below 1", () => {
    expect(createActivitySchema.safeParse({ dayNumber: 0, description: "x" }).success).toBe(false);
  });
  it("rejects a non-integer dayNumber", () => {
    expect(createActivitySchema.safeParse({ dayNumber: 1.5, description: "x" }).success).toBe(false);
  });
  it("accepts a valid activity", () => {
    expect(createActivitySchema.safeParse({ dayNumber: 1, description: "Arrive" }).success).toBe(true);
  });
});
