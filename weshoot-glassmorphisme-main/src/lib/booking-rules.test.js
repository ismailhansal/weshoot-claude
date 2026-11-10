import { describe, expect, test } from "bun:test";
import {
  getBookingSteps,
  getFirstName,
  getSafeBookingReturnPath,
  getVisibleReviews,
  isDateBeforeToday,
  isProjectDescriptionValid,
} from "./booking-rules.ts";

describe("marketplace display and booking limits", () => {
  test("accepts project descriptions up to 500 characters and rejects longer text", () => {
    expect(isProjectDescriptionValid("a".repeat(500))).toBe(true);
    expect(isProjectDescriptionValid("a".repeat(501))).toBe(false);
  });

  test("shows only six reviews", () => {
    expect(getVisibleReviews([1, 2, 3, 4, 5, 6, 7, 8])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("shows first names without surnames", () => {
    expect(getFirstName("Sophie Laurent")).toBe("Sophie");
  });

  test("resumes only safe booking paths after demo sign-in", () => {
    expect(getSafeBookingReturnPath("/book/3?offer=portrait")).toBe("/book/3?offer=portrait");
    expect(getSafeBookingReturnPath("https://example.com")).toBe("/explore");
  });

  test("chosen offer skips the type and brief steps", () => {
    expect(getBookingSteps("offer", true)).toEqual(["choice", "date", "summary"]);
  });

  test("free project asks photo/video type only for photo & video creators", () => {
    expect(getBookingSteps("project", true)).toEqual(["choice", "type", "date", "brief", "summary"]);
    expect(getBookingSteps("project", false)).toEqual(["choice", "date", "brief", "summary"]);
  });

  test("blocks dates before today", () => {
    expect(isDateBeforeToday("2026-11-08", "2026-11-09")).toBe(true);
    expect(isDateBeforeToday("2026-11-09", "2026-11-09")).toBe(false);
  });
});