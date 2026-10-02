import { describe, it, expect } from "vitest";
import { dayCount } from "./dayCount";

describe("dayCount", () => {
  it("counts a single day as 1", () => {
    expect(dayCount(new Date("2027-04-01"), new Date("2027-04-01"))).toBe(1);
  });

  it("counts an inclusive range", () => {
    expect(dayCount(new Date("2027-04-01"), new Date("2027-04-04"))).toBe(4);
  });

  it("counts across a month boundary", () => {
    expect(dayCount(new Date("2027-03-30"), new Date("2027-04-02"))).toBe(4);
  });
});
